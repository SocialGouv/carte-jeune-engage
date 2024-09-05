import gsap, { Cubic } from "gsap";

export const loginAnimation = () => {
  gsap.fromTo(
    "#login-heading",
    {
      transform: "translateY(35vh)",
    },
    {
      transform: "translateY(0)",
      delay: 0.5,
      ease: Cubic.easeIn,
      duration: 0.75,
    }
  );

  gsap.fromTo(
    "#login-form",
    {
      transform: "translateY(70vh)",
      opacity: 0,
    },
    {
      transform: "translateY(0)",
      opacity: 1,
      ease: Cubic.easeIn,
      delay: 0.5,
      duration: 0.75,
    }
  );

  gsap.fromTo(
    "#login-gov-image",
    {
      opacity: 0,
    },
    {
      opacity: 1,
      ease: Cubic.easeIn,
      delay: 1.2,
      duration: 0.3,
    }
  );
};
