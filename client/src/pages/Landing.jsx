import { Hero } from "../components/ui/animated-hero";
import { SplineScene } from "../components/ui/splite";
import { Button } from "../components/ui/button";
import Logo from "../assets/logo.png";

const Landing = () => {
    return (
        <div className="h-screen bg-[#000000] flex flex-col items-center relative overflow-hidden" style={{ background: '#000000' }}>
            {/* Header / Nav Placeholder */}
            <div className="w-full border-b border-transparent py-4 px-6 flex justify-between items-center relative z-20">
                <div className="font-bold text-xl flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center">
                        <img src={Logo} alt="ELMS Logo" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-white">Leave Management</span>
                </div>
                <div className="flex gap-2 items-center">
                    <Button variant="ghost" size="sm" className="text-white hover:bg-neutral-800 hover:text-white transition-colors" asChild>
                        <a href="/login">Login</a>
                    </Button>
                    <Button size="sm" className="bg-primary text-black hover:bg-primary/90 transition-colors" asChild>
                        <a href="/register">Get Started</a>
                    </Button>
                </div>
            </div>

            {/* Robot — Centered at bottom (Black background) */}
            <div className="absolute left-1/2 bottom-[-450px] sm:bottom-[-400px] md:bottom-[-350px] lg:bottom-[-380px] -translate-x-1/2 z-0 w-[600px] sm:w-[800px] lg:w-[1000px] h-[800px] sm:h-[1000px] lg:h-[1200px] pointer-events-none transition-all duration-500">
                <div className="w-full h-full rounded-2xl relative overflow-hidden" style={{ background: '#000000' }}>
                    <SplineScene
                        scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                        className="w-full h-full"
                    />
                </div>
            </div>

            <main className="flex-1 w-full flex items-center justify-center pt-32 relative z-10 px-6">
                <Hero />
            </main>

            {/* Footer Placeholder - Absolute at bottom */}
            <footer className="absolute bottom-6 w-full flex flex-col items-center gap-2 z-20 text-white">
                <p className="text-xs opacity-40">© 2026 Employee Leave Management System. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Landing;
