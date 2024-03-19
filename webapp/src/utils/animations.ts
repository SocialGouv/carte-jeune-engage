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

export const couponAnimation = (isSuccess: boolean, couponExists: boolean) => {
  if (isSuccess) {
    gsap.to("#coupon-code-icon", {
      backgroundColor: "#42B918",
      color: "white",
      duration: 1,
    });

    gsap.to("#coupon-code-icon-lock", {
      display: "none",
      duration: 0,
      delay: 0.5,
    });

    gsap.to("#coupon-code-icon-unlock", {
      display: "block",
      duration: 0,
      delay: 0.5,
    });
  }

  gsap.to("#coupon-code-icon", {
    opacity: couponExists ? 0 : 1,
    duration: isSuccess ? 0.5 : 0,
    delay: isSuccess ? 1.25 : 0,
  });

  gsap.to("#coupon-code-text", {
    filter: couponExists ? "blur(0px)" : "blur(4.5px)",
    webkitFilter: couponExists ? "blur(0px)" : "blur(4.5px)",
    duration: isSuccess ? 1 : 0,
    delay: isSuccess ? 1.75 : 0,
  });
};
