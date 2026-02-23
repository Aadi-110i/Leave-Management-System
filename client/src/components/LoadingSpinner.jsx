const LoadingSpinner = ({ text = 'Loading...' }) => (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="w-8 h-8 border-3 border-dark border-t-transparent rounded-full animate-spin border-[3px]" />
        <p className="text-sm text-dark/50 font-medium">{text}</p>
    </div>
);

export default LoadingSpinner;
