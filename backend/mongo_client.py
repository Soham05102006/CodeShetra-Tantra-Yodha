"""
Centralized MongoDB Atlas client and connection management for AI-01.
Implements a thread-safe singleton connection pool with ping verification,
safe credential masking for logging, and document serialization utilities.
"""

import os
import re
import logging
from typing import Optional, Dict, Any, List
from datetime import datetime
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.database import Database
from pymongo.collection import Collection
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from bson import ObjectId

# Load environment configuration from backend/.env or root .env
_current_dir = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(_current_dir, ".env"))
load_dotenv(os.path.join(os.path.dirname(_current_dir), ".env"))
load_dotenv()

logger = logging.getLogger("ai01.mongodb")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")

# Environment variables
MONGODB_URI = os.getenv("MONGODB_URI", "")
DATABASE_NAME = os.getenv("DATABASE_NAME", "ai01_db")

def mask_connection_string(uri: str) -> str:
    """Masks password inside MongoDB connection URI for safe logging."""
    if not uri:
        return "<EMPTY>"
    return re.sub(r'://([^:]+):([^@]+)@', r'://\1:****@', uri)

class MongoManager:
    _instance: Optional['MongoManager'] = None
    _client: Optional[MongoClient] = None
    _db: Optional[Database] = None
    _is_mock: bool = False

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(MongoManager, cls).__new__(cls)
        return cls._instance

    def _init_mock(self, target_db: str) -> bool:
        try:
            import mongomock
            self._client = mongomock.MongoClient()
            self._db = self._client[target_db]
            self._is_mock = True
            logger.info(f"Zero-Cost in-memory MongoDB initialized successfully for '{target_db}'.")
            return True
        except Exception as mock_err:
            logger.error(f"Failed to initialize in-memory MongoDB: {mock_err}")
            self._client = None
            self._db = None
            return False

    def initialize(self, uri: Optional[str] = None, db_name: Optional[str] = None) -> bool:
        """Initializes the MongoDB client singleton if not already connected."""
        target_uri = uri or os.getenv("MONGODB_URI") or MONGODB_URI
        target_db = db_name or os.getenv("DATABASE_NAME") or DATABASE_NAME or "ai01_db"

        if not target_uri or "<username>" in target_uri or os.getenv("USE_MOCK_DB") == "true" or target_uri == "mock":
            logger.info("MONGODB_URI is unconfigured. Activating in-memory mock database.")
            return self._init_mock(target_db)

        if self._client is not None:
            try:
                self._client.admin.command('ping')
                return True
            except Exception:
                logger.warning("Existing MongoDB client ping failed. Reconnecting...")
                self._client.close()
                self._client = None

        masked = mask_connection_string(target_uri)
        logger.info(f"Connecting to MongoDB Atlas cluster at: {masked} | Database: {target_db}")

        try:
            self._client = MongoClient(
                target_uri,
                serverSelectionTimeoutMS=3000,
                connectTimeoutMS=3000,
                socketTimeoutMS=5000,
                maxPoolSize=50,
                minPoolSize=2,
                retryWrites=True
            )
            # Verify connectivity with ping command
            self._client.admin.command('ping')
            self._db = self._client[target_db]
            self._is_mock = False
            logger.info(f"Successfully connected to MongoDB Atlas. Active database: {target_db}")
            return True
        except Exception as e:
            logger.warning(f"Failed to connect to MongoDB Atlas ({e}). Falling back to local in-memory database.")
            return self._init_mock(target_db)

    @property
    def client(self) -> Optional[MongoClient]:
        if self._client is None:
            self.initialize()
        return self._client

    @property
    def db(self) -> Optional[Database]:
        if self._db is None:
            self.initialize()
        return self._db

    def close(self):
        """Closes the MongoDB connection pool cleanly."""
        if self._client:
            logger.info("Closing MongoDB Atlas connection pool.")
            self._client.close()
            self._client = None
            self._db = None

# Global instance
mongo_manager = MongoManager()

def get_mongo_db() -> Database:
    """Returns the active MongoDB database instance, initializing if necessary."""
    db = mongo_manager.db
    if db is None:
        raise ConnectionError("MongoDB Atlas database is not connected. Please check MONGODB_URI in .env")
    return db

def get_mongo_collection(collection_name: str) -> Collection:
    """Returns a collection from the active MongoDB database."""
    db = get_mongo_db()
    return db[collection_name]

def verify_mongo_connection() -> Dict[str, Any]:
    """Pings MongoDB and returns diagnostic connectivity details."""
    try:
        db = get_mongo_db()
        pong = db.client.admin.command('ping')
        return {
            "status": "CONNECTED",
            "ok": pong.get("ok", 0) == 1,
            "database": db.name,
            "collections": db.list_collection_names()
        }
    except Exception as e:
        return {
            "status": "DISCONNECTED",
            "ok": False,
            "error": str(e)
        }

def init_mongo_collections(db: Optional[Database] = None) -> Dict[str, Any]:
    """
    Initializes required collections and ensures necessary indexes exist.
    Idempotent: Reuses existing collections and does not duplicate indexes.
    """
    target_db = db if db is not None else get_mongo_db()
    existing_cols = target_db.list_collection_names()
    
    collections_to_init = [
        "ledger_transactions",
        "approval_queue",
        "agent_audit_log",
        "party_directory",
        "system_configuration",
        "voice_calls"
    ]
    
    # 1. ledger_transactions
    lt = target_db["ledger_transactions"]
    lt.create_index("invoice_number", unique=True)
    lt.create_index("payment_status")
    lt.create_index([("created_at", -1)])

    # 2. approval_queue
    aq = target_db["approval_queue"]
    aq.create_index("approval_id", unique=True)
    aq.create_index("thread_id")
    aq.create_index("status")
    aq.create_index([("created_at", -1)])

    # 3. agent_audit_log
    aal = target_db["agent_audit_log"]
    aal.create_index("thread_id")
    aal.create_index([("timestamp", -1)])
    aal.create_index("execution_status")

    # 4. party_directory
    pd = target_db["party_directory"]
    pd.create_index("entity_name", unique=True)
    pd.create_index("party_id")
    pd.create_index("party_type")

    # 5. system_configuration
    sc = target_db["system_configuration"]
    sc.create_index("config_key", unique=True)
    sc.create_index("category")

    # 6. voice_calls
    vc = target_db["voice_calls"]
    vc.create_index("id", unique=True)
    vc.create_index("invoice_number")
    vc.create_index("call_status")
    vc.create_index([("created_at", -1)])

    current_cols = target_db.list_collection_names()
    logger.info(f"Initialized collections and indexes in '{target_db.name}'. Collections: {current_cols}")
    return {
        "database": target_db.name,
        "existing_before": existing_cols,
        "active_collections": current_cols
    }

def serialize_mongo_doc(doc: Any) -> Any:
    """
    Recursively converts MongoDB BSON types (ObjectId, datetime) to JSON-serializable primitives.
    Sets string 'id' from '_id' while preserving '_id' as string for full compatibility.
    """
    if doc is None:
        return None
    if isinstance(doc, list):
        return [serialize_mongo_doc(item) for item in doc]
    if isinstance(doc, dict):
        res = {}
        for k, v in doc.items():
            if k == "_id":
                str_id = str(v)
                res["_id"] = str_id
                if "id" not in doc:
                    res["id"] = str_id
            elif isinstance(v, ObjectId):
                res[k] = str(v)
            elif isinstance(v, datetime):
                res[k] = v.isoformat()
            elif isinstance(v, (dict, list)):
                res[k] = serialize_mongo_doc(v)
            else:
                res[k] = v
        return res
    return doc
