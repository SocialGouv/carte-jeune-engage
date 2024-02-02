import gsap, { Cubic } from 'gsap';

export const couponAnimation = (isSuccess: boolean, couponExists: boolean) => {
  if (isSuccess) {
    gsap.to('#coupon-code-icon', {
      backgroundColor: '#42B918',
      color: 'white',
      duration: 1
    });

    gsap.to('#coupon-code-icon-lock', {
      display: 'none',
      duration: 0,
      delay: 0.5
    });

    gsap.to('#coupon-code-icon-unlock', {
      display: 'block',
      duration: 0,
      delay: 0.5
    });
  }

  gsap.to('#coupon-code-icon', {
    opacity: couponExists ? 0 : 1,
    duration: isSuccess ? 0.5 : 0,
    delay: isSuccess ? 1.25 : 0
  });

  gsap.to('#coupon-code-text', {
    filter: couponExists ? 'blur(0px)' : 'blur(4.5px)',
    duration: isSuccess ? 1 : 0,
    delay: isSuccess ? 1.75 : 0
  });

  if (isSuccess) {
    gsap.fromTo(
      '.coupon-info',
      {
        scaleY: 0,
        opacity: 0,
        transformOrigin: 'top'
      },
      {
        scaleY: 1,
        transformOrigin: 'top',
        opacity: 1,
        ease: Cubic.easeIn,
        duration: 0.75,
        delay: 1.5
      }
    );

    gsap.fromTo(
      '.btn-utils',
      {
        opacity: 0,
        translateY: -35
      },
      {
        opacity: 1,
        translateY: 0,
        duration: 1,
        ease: Cubic.easeIn,
        delay: 1.5
      }
    );

    gsap.fromTo(
      '.btn-conditions',
      {
        translateY: -35,
        delay: 1
      },
      {
        opacity: 1,
        duration: 1,
        translateY: 0,
        ease: Cubic.easeIn,
        delay: 1.5
      }
    );
  }
};