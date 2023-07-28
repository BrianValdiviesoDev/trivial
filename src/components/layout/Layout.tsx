import { useCallback } from "react";
import Particles from "react-particles";
import { loadFull } from "tsparticles";
import type { Container, Engine } from "tsparticles-engine";
import { useAppStatusStore } from "../../store/appStatusStore";
import { AnimatePresence, motion } from "framer-motion";

type Props = {
  children: React.ReactNode;
};

const Layout: React.FC<Props> = ({ children }) => {
  // Particles constants
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadFull(engine);
  }, []);

  const particlesLoaded = useCallback(
    async (container: Container | undefined) => {
      await container?.refresh();
    },
    []
  );

  // Store
  const { isAppLoading } = useAppStatusStore();

  return (
    <div className="container">
      <AnimatePresence mode="wait">
        {isAppLoading && (
          <motion.div
            className="loader-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <span className="loader"></span>
          </motion.div>
        )}
      </AnimatePresence>
      <main className="main">{children}</main>
      <Particles
        id="tsparticles"
        init={particlesInit}
        loaded={particlesLoaded}
        options={{
          fpsLimit: 60,
          fullScreen: {
            enable: false
          },
          interactivity: {
            detectsOn: "canvas",
            events: {
              onClick: {
                enable: true,
                mode: "push"
              },
              onHover: {
                enable: true,
                mode: "grab"
              },
              resize: true
            },
            modes: {
              push: {
                quantity: 4
              },
              repulse: {
                distance: 200,
                duration: 0.4
              },
              grab: {
                distance: 140,
                line_linked: {
                  opacity: 1
                }
              }
            }
          },
          particles: {
            color: {
              value: "#4052a0"
            },
            links: {
              color: "transparent"
            },
            collisions: {
              enable: true
            },
            move: {
              direction: "none",
              enable: true,
              outModes: {
                default: "bounce"
              },
              random: false,
              speed: 1,
              straight: false
            },
            number: {
              density: {
                enable: false,
                area: 800
              },
              value: 20
            },
            opacity: {
              value: 0.5
            },
            shape: {
              type: "image",
              image: [
                {
                  src: "/assets/question.svg",
                  height: 20,
                  width: 20
                },
                {
                  src: "/assets/triangle.svg",
                  height: 20,
                  width: 20
                }
              ]
            },
            size: {
              value: { min: 20, max: 50 }
            }
          },
          detectRetina: true
        }}
      />
    </div>
  );
};

export default Layout;
