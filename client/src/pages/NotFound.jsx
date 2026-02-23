import { Link } from 'react-router-dom';
import { MdHome, MdWork } from 'react-icons/md';

const NotFound = () => (
    <div className="min-h-screen bg-beige-300 flex flex-col items-center justify-center text-center px-4">
        <div className="w-20 h-20 bg-dark rounded-2xl flex items-center justify-center mb-6 animate-float">
            <MdWork className="text-beige-300" size={40} />
        </div>
        <h1 className="text-8xl font-black text-dark/20 mb-2">404</h1>
        <h2 className="text-2xl font-bold text-dark mb-2">Page Not Found</h2>
        <p className="text-dark/50 mb-8 max-w-sm">
            The page you're looking for doesn't exist or you don't have permission to access it.
        </p>
        <Link to="/login" className="btn-primary flex items-center gap-2 inline-flex">
            <MdHome size={18} />
            Back to Login
        </Link>
    </div>
);

export default NotFound;
