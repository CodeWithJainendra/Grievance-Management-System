import { Link } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Input,
  Button,
  Typography,
} from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { 
  UserIcon, 
  LockClosedIcon, 
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline";
import httpService from "@/services/httpService";
import { login } from "@/context/UserContext";
import { useTheme } from "@/context";
import { ToastContainer, toast } from "react-toastify";

export function SignIn() {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const [email, setEmail] = useState("admin");
  const [password, setPassword] = useState("admin");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (error) {
      toast("Invalid credentials!", {
        type: "error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className={`min-h-screen flex items-center justify-center p-4 ${
        isDark ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
              isDark ? 'bg-gray-800' : 'bg-slate-100'
            }`}>
              <ShieldCheckIcon className={`w-8 h-8 ${
                isDark ? 'text-gray-300' : 'text-slate-600'
              }`} />
            </div>
            <h1 className={`text-2xl font-semibold mb-1 ${
              isDark ? 'text-white' : 'text-slate-800'
            }`}>
              IGMS Portal
            </h1>
            <p className={`text-sm ${
              isDark ? 'text-gray-400' : 'text-slate-500'
            }`}>
              Intelligent Grievance Management System
            </p>
          </div>

          {/* Login Card */}
          <Card className={`shadow-lg border ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'
          }`}>
            <CardHeader className={`text-center py-6 border-b ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-100'
            }`}>
              <Typography variant="h5" className={`font-medium ${
                isDark ? 'text-white' : 'text-slate-700'
              }`}>
                Sign In
              </Typography>
              <Typography variant="small" className={`mt-1 ${
                isDark ? 'text-gray-400' : 'text-slate-500'
              }`}>
                Enter your credentials to access the dashboard
              </Typography>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardBody className="p-6 space-y-4">
                 <div>
                   <Typography variant="small" className={`mb-2 font-medium ${
                     isDark ? 'text-gray-300' : 'text-slate-600'
                   }`}>
                     Username
                   </Typography>
                   <div className="relative">
                     <UserIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                       isDark ? 'text-gray-500' : 'text-slate-400'
                     }`} />
                     <Input
                          type="text"
                          size="lg"
                          value={email}
                          onChange={(e) => setEmail(e.target.value.toLowerCase())}
                          className={`pl-10 ${
                            isDark 
                              ? '!border-gray-600 focus:!border-blue-500 !bg-gray-700 !text-white' 
                              : '!border-slate-300 focus:!border-slate-500'
                          }`}
                          labelProps={{
                            className: "hidden",
                          }}
                          autoFocus
                        />
                      </div>
                    </div>

                    <div>
                      <Typography variant="small" className={`mb-2 font-medium ${
                        isDark ? 'text-gray-300' : 'text-slate-600'
                      }`}>
                        Password
                      </Typography>
                      <div className="relative">
                        <LockClosedIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                          isDark ? 'text-gray-500' : 'text-slate-400'
                        }`} />
                        <Input
                          type="password"
                          size="lg"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className={`pl-10 ${
                            isDark 
                              ? '!border-gray-600 focus:!border-blue-500 !bg-gray-700 !text-white' 
                              : '!border-slate-300 focus:!border-slate-500'
                          }`}
                          labelProps={{
                            className: "hidden",
                          }}
                        />
                      </div>
                    </div>
               </CardBody>

               <CardFooter className="pt-0 px-6 pb-6">
                 <button
                   type="submit"
                   className={`w-full py-4 px-6 rounded-lg font-semibold text-lg shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                     isDark 
                       ? 'bg-blue-600 hover:bg-blue-700 text-white border-2 border-blue-500' 
                       : 'bg-gray-900 hover:bg-black text-white border-2 border-gray-800'
                   }`}
                   disabled={isLoading}
                   style={{
                     color: '#ffffff',
                     backgroundColor: isDark ? '#2563eb' : '#111827',
                     borderColor: isDark ? '#3b82f6' : '#374151'
                   }}
                 >
                   {isLoading ? (
                     <div className="flex items-center justify-center gap-3" style={{ color: '#ffffff' }}>
                       <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                       <span style={{ color: '#ffffff', fontWeight: '600' }}>Signing In...</span>
                     </div>
                   ) : (
                     <div className="flex items-center justify-center gap-3" style={{ color: '#ffffff' }}>
                       <ArrowRightOnRectangleIcon className="w-5 h-5" style={{ color: '#ffffff' }} />
                       <span style={{ color: '#ffffff', fontWeight: '600' }}>Sign In</span>
                     </div>
                   )}
                 </button>

                 <Typography variant="small" className={`text-center mt-4 ${
                   isDark ? 'text-gray-400' : 'text-slate-500'
                 }`}>
                   Contact administrator for access credentials
                 </Typography>
               </CardFooter>
             </form>
           </Card>

           {/* Footer */}
           <div className="text-center mt-6">
             <Typography variant="small" className={`${
               isDark ? 'text-gray-500' : 'text-slate-400'
             }`}>
               © 2024 IGMS Portal. Government of India.
             </Typography>
           </div>
         </div>
       </div>
       <ToastContainer />
     </>
   );
}

export default SignIn;
