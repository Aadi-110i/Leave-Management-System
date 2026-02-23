import { Suspense, lazy, useRef, useEffect } from 'react'

const Spline = lazy(() => import('@splinetool/react-spline'))

export function SplineScene({ scene, className }) {
    const containerRef = useRef(null)

    useEffect(() => {
        const handleMouseMove = (e) => {
            // CRITICAL: Only respond to real user interactions
            // This prevents the infinite recursion loop that was hanging the page
            if (!e.isTrusted) return

            if (!containerRef.current) return
            const canvas = containerRef.current.querySelector('canvas')
            if (!canvas) return

            const opts = {
                clientX: e.clientX,
                clientY: e.clientY,
                screenX: e.screenX,
                screenY: e.screenY,
                pageX: e.pageX,
                pageY: e.pageY,
                bubbles: false, // Do not bubble to avoid any chance of capturing this event again
                cancelable: true,
                pointerType: 'mouse',
                isPrimary: true,
            }

            // Forward to Spline's internal raycaster
            canvas.dispatchEvent(new PointerEvent('pointermove', opts))
            canvas.dispatchEvent(new MouseEvent('mousemove', opts))
        }

        // Use capture phase to catch events before they reach the login form UI
        window.addEventListener('pointermove', handleMouseMove, { capture: true, passive: true })
        window.addEventListener('mousemove', handleMouseMove, { capture: true, passive: true })

        return () => {
            window.removeEventListener('pointermove', handleMouseMove, { capture: true })
            window.removeEventListener('mousemove', handleMouseMove, { capture: true })
        }
    }, [])

    return (
        <div ref={containerRef} style={{ width: '100%', height: '100%', backgroundColor: '#000000' }}>
            <Suspense
                fallback={
                    <div className="w-full h-full flex items-center justify-center">
                        <span className="loader"></span>
                    </div>
                }
            >
                <Spline scene={scene} className={className} />
            </Suspense>
        </div>
    )
}
