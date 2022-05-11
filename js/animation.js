import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ScrollSmoother } from "gsap/ScrollSmoother"
import { SplitText } from "gsap/SplitText"

gsap.registerPlugin(ScrollTrigger, SplitText)


export default class animation {
    constructor() {


        gsap.utils.toArray('.h1').forEach(title => {
            const childSplit = new SplitText(title, {
              type: "lines",
              linesClass: "split-child"
            });
            const parentSplit = new SplitText(title, {
              linesClass: "split-parent"
            });
            
            gsap.from(childSplit.lines, {
              scrollTrigger: title,
              start: 'top center',
              duration: 3.5,
              // delay: 2,
              y: "100%",
              ease: "power4",
              skewY: 3,
              stagger: 0.05
            });           
        })


    }
}