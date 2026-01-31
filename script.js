document.addEventListener("DOMContentLoaded", () => {
    gsap.registerPlugin(ScrollTrigger);


    const lenis = new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

const cardContainer = document.querySelector(".card-container");
const stickyHeader = document.querySelector(".sticky-header h1");
const cards = document.querySelectorAll(".card");

let isGapAnimationCompleted = false;
let isFlipAnimationCompleted = false;


const gapTl = gsap.timeline({paused: true});
gapTl
.to(cardContainer, { gap: 30, duration: 1, ease: "power3.out"}, 0)
.to("#card-1", { x: -30, duration: 1, ease: "power3.out"}, 0)
.to("#card-3", { x: 30, duration: 1, ease: "power3.out"}, 0)
.to(cards, { borderRadius: "20px", duration: 1, ease: "power3.out"}, 0);

const flipTl = gsap.timeline ({paused: true});
flipTl
.to (
    ".card",
    {
        rotationY: 180,
        duration: 1,
        ease: "power3.inOut",
        stagger: 0.1,
        transformOrigin: "center center"
    },
    0
)
.to(
    ["#card-1", "#card-3"],
    {
        y: 30,
        rotationZ: (i) => (i === 0 ? -15 : 15),
        duration: 1,
        ease: "power3.inOut",
    },
    0
);

function setDefaults() {
    document
    .querySelectorAll(".card, .card-container, .sticky-header h1")
    .forEach((el) => {
        if(el && el.style) el.style.cssText = "";
    });

    gapTl.pause(0);
    flipTl.pause(0);
    isGapAnimationCompleted = false;
    isFlipAnimationCompleted = false;
}

function updateHeader(progress){

    if (progress >= 0.1 && progress <= 0.35) {
        const headerProgress = gsap.utils.mapRange(0.1, 0.35, 0, 1, progress);
        const yValue = gsap.utils.mapRange(0, 1, 40, 0, headerProgress);
        const opacityValue = gsap.utils.mapRange(0, 1, 0, 1, headerProgress);
        gsap.set(stickyHeader, { y: yValue, opacity: opacityValue});
    } else if (progress < 0.1) {
        gsap.set(stickyHeader, { y: 40, opacity: 0 });
    } else {
        gsap.set(stickyHeader, { y: 0, opacity: 1 });
    }
}

function updateCardWidth(progress) {
    if (progress <= 0.35) {
        const widthPercentage = gsap.utils.mapRange(0, 0.35, 75, 60, progress);
        gsap.set(cardContainer, { width: `${widthPercentage}%`});
    } else {
        gsap.set(cardContainer, { width: "60%" });
    }
}

function handleGapAnimation (progress) {

    if (progress >= 0.45 && !isGapAnimationCompleted) {
        gapTl.play();
        isGapAnimationCompleted = true;
    } else if (progress < 0.45 && isGapAnimationCompleted) {
        gapTl.reverse();
        isGapAnimationCompleted = false;
    }
}

function handleFlipAnimation(progress) {

    if (progress >= 0.7 && !isFlipAnimationCompleted) {
        flipTl.play();
        isFlipAnimationCompleted = true;
    } else if (progress < 0.7 && isFlipAnimationCompleted) {
        flipTl.reverse();
        isFlipAnimationCompleted = false;
    }
}


function initAnimations() {

    ScrollTrigger.getAll().forEach((t) => t.kill());
    setDefaults();

    const mm = gsap.matchMedia();

    mm.add("(max-width: 999px)", () => {

        setDefaults();
        return () => {};
    });

    mm.add("(min-width: 1000px)", () => {
        const st = ScrollTrigger.create({
            trigger: ".sticky",
            start: "top top",
            end: `+=${window.innerHeight * 4}px`,
            scrub: 1,
            pin: true,
            pinSpacing: true,
            markers: true,
            onUpdate(self) {
                const progress = self.progress;

                updateHeader(progress);
                updateCardWidth(progress);
                handleGapAnimation(progress);
                handleFlipAnimation(progress);
            }
        });

        return () => st.kill();
    });

    return () => mm.revert();
}


initAnimations(); 

let resizeTimer;
window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() =>{
        initAnimations ();
        ScrollTrigger.refresh();
    }, 220);
});
});
