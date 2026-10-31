import React, { useState } from 'react'
import LoginLeftSide from './LoginLeftSide' // Matches line 2 in your screenshot
import { Link } from 'react-router-dom'     // Matches line 3 in your screenshot
import { ArrowLeftIcon, EyeOffIcon, EyeIcon, Loader2Icon } from 'lucide-react' // Matches line 4 in your screenshot (Note: Video uses ArrowLeftIcon)

const LoginForm = ({ role, title, subtitle }) => { // Matches line 6 in your screenshot
    
    // State management created starting from 56:35 
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState("")       // Matches line 11 in your screenshot
    const [loading, setLoading] = useState("")   // Matches line 12 in your screenshot

    const handleSubmit = (e) => {
        e.preventDefault()
        setError("")
        
        if (!email || !password) {
            setError("Please fill in all fields.")
            return
        }
        
        console.log("Submitting form:", { email, password, role })
    }

    return (
        // Wrapper container matching line 15 in your screenshot
        <div className='min-h-screen flex flex-col md:flex-row bg-slate-50'>
            
            {/* Split Screen Left Graphic Panel */}
            <LoginLeftSide /> {/* Matches line 16 in your screenshot */}

            {/* Right Side Form Panel Layout Container */}
            <div className='flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-16'>
                <div className='w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-slate-100 relative'>
                    
                    {/* Back Button Navigation link */}
                    <div className='absolute top-6 left-8'>
                        <Link to="/" className='flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors'>
                            <ArrowLeftIcon className='w-4 h-4 mr-1.5' />
                            Back to portals
                        </Link>
                    </div>

                    {/* Dynamic Branding Header matching your Figma layout */}
                    <div className='mt-6 mb-8 text-left'>
                        <h2 className='text-3xl font-bold text-slate-900 tracking-tight'>
                            {title || `${role === 'admin' ? 'Admin' : 'Employee'} Portal`}
                        </h2>
                        <p className='text-sm text-slate-500 mt-2'>
                            {subtitle || 'Sign in to access your account'}
                        </p>
                    </div>

                    {/* Conditional Error Notification Box */}
                    {error && (
                        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 font-medium">
                            {error}
                        </div>
                    )}

                    {/* The Authentication Input Elements Section */}
                    <form onSubmit={handleSubmit} className='space-y-5'>
                        
                        {/* Email Input Block */}
                        <div className='space-y-1.5'>
                            <label className='text-xs font-semibold text-slate-700 tracking-wide uppercase'>
                                Email address
                            </label>
                            <input 
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="john@example.com"
                                className='block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none'
                            />
                        </div>

                        {/* Password Input Block */}
                        <div className='space-y-1.5'>
                            <div className='flex items-center justify-between'>
                                <label className='text-xs font-semibold text-slate-700 tracking-wide uppercase'>
                                    Password
                                </label>
                            </div>
                            <div className='relative'>
                                <input 
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className='block w-full pl-4 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none'
                                />
                                {/* Inline dynamic indicator element to toggle raw layout visibility */}
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className='absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors'
                                >
                                    {showPassword ? (
                                        <EyeOffIcon className='w-4 h-4' />
                                    ) : (
                                        <EyeIcon className='w-4 h-4' />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Form Action Controls Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className='w-full py-3 px-4 mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-all active:scale-[0.99] disabled:opacity-50'
                        >
                            {loading && <Loader2Icon className='animate-spin h-4 w-4 mr-2' />}
                            Sign in
                        </button>

                    </form>
                </div>
            </div>
        </div>
    )
}

export default LoginForm