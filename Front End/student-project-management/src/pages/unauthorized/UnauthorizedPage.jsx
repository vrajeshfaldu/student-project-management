import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home, Lock, KeyRound, HelpCircle, UserCheck, LogIn } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { storage } from '../../helpers';

export const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = storage.getAuthToken();
  const user = storage.getAuthUser();
  const role = storage.getAuthRole();
  const isAuthenticated = Boolean(token);

  const stateData = location.state || {};
  const actualRole = stateData.actualRole || role || 'Student';
  const selectedRole = stateData.selectedRole || null;
  const isPortalMismatch = Boolean(selectedRole && stateData.actualRole);
  const userDisplayName = stateData.user?.FullName || user?.FullName || 'Account User';
  const customMessage = stateData.message || (
    isPortalMismatch
      ? `You attempted to log in using the "${selectedRole} Portal", but your account belongs to the "${actualRole}" role.`
      : 'You do not possess the required security privileges or role authorizations to view this administrative resource.'
  );

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gray-50">
      <div className="w-full max-w-3xl bg-white rounded-3xl border border-gray-200/80 shadow-xl overflow-hidden transition-all">
        {/* Header Hero Banner */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 p-8 sm:p-10 text-white relative overflow-hidden">
          <div className="absolute right-[-20px] top-[-20px] opacity-10 pointer-events-none">
            <Lock className="w-64 h-64 text-white" />
          </div>

          <div className="flex items-center gap-3 mb-3">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-wider text-white border border-white/30">
              HTTP 403 FORBIDDEN
            </span>
            <span className="px-3 py-1 bg-black/20 backdrop-blur-md rounded-full text-xs font-bold text-red-100">
              {isPortalMismatch ? 'Portal Role Mismatch' : 'Role Permission Constraint'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2 flex items-center gap-3">
            <ShieldAlert className="w-9 h-9 text-amber-300 shrink-0" />
            Access Restricted
          </h1>
          <p className="text-sm sm:text-base text-red-100 font-medium max-w-xl">
            {customMessage}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* User Role Diagnostic Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                <UserCheck className="w-4 h-4 text-indigo-600" /> Account Verified Role
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-base font-extrabold text-gray-900">{userDisplayName}</span>
                <Badge variant="primary">{actualRole}</Badge>
              </div>
            </div>

            <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/70">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">
                <KeyRound className="w-4 h-4 text-amber-600" /> Selected Target Portal
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-base font-extrabold text-amber-950">
                  {selectedRole ? `${selectedRole} Portal` : 'Administrative Privilege'}
                </span>
                <Badge variant="danger">{selectedRole ? `${selectedRole} Only` : 'Admin Only'}</Badge>
              </div>
            </div>
          </div>

          {/* Detailed Troubleshooting & Reasons */}
          <div className="bg-gray-50/70 p-5 rounded-2xl border border-gray-100 space-y-3">
            <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-600" /> Why am I seeing this screen?
            </h3>
            <ul className="text-xs text-gray-600 space-y-2 font-medium list-disc pl-5">
              {isPortalMismatch ? (
                <>
                  <li>You selected the <strong>{selectedRole} Portal</strong> button during sign-in.</li>
                  <li>Your validated JWT authentication token confirms your account has <strong>{actualRole}</strong> privileges.</li>
                  <li>To access the system, please select the <strong>{actualRole} Portal</strong> button on the login screen.</li>
                </>
              ) : (
                <>
                  <li>This administrative section is restricted strictly to authorized roles.</li>
                  <li>Your current account is assigned to the <strong>{actualRole}</strong> role level in the system.</li>
                  <li>If you require elevated access, request role permission updates from your administrator.</li>
                </>
              )}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100">
            <Button
              variant="outline"
              icon={ArrowLeft}
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto"
            >
              Back to Login
            </Button>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button
                variant="primary"
                icon={LogIn}
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto"
              >
                Sign In with Correct Portal
              </Button>
              {isAuthenticated && (
                <Button
                  variant="outline"
                  icon={Home}
                  onClick={() => navigate('/dashboard')}
                  className="w-full sm:w-auto"
                >
                  Dashboard
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
