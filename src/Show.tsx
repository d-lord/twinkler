import React from "react";
import hljs from "highlight.js";
import './Show.css';
import 'highlight.js/styles/nord.css';
import {Link} from "react-router-dom";

export interface ShowProps {
    userCode: string
    animationStylesheetId: string
}

interface ShowState {
    formattedCode: string   // HTML for the highlighted <pre> and everything inside it
    allClasses: string[]        // all CSS classes to animate (eg "hljs-string")
    currentlyAnimating: boolean // tracked as state so we can tell the StartStopButton; otherwise we'd have to query for the stylesheet every time
}

interface StartStopButtonProps {
    onClick: (event: any) => void
    currentlyAnimating: boolean
}

function StartStopButton(props: StartStopButtonProps) {
    return <button onClick={props.onClick} className="startstop">{props.currentlyAnimating ? "Cease" : "Resume"}</button>
}


export default class Show extends React.Component<ShowProps, ShowState> {
    /* Shows the user code with twinkly, animated colours.
    * Defines two stylesheets on the fly: one for the animations on syntax classes, one to override that animation state.
    * They're created and destroyed along with the component.
    *  */

    // this was a function, but I had problems with useEffect calling toggle() in an infinite loop,
    // so switched to a class for the explicit control over componentWillUnmount
    constructor(props: ShowProps) {
        super(props);
        this.state = {currentlyAnimating: true, formattedCode: "", allClasses: []}
    }

    // https://stackoverflow.com/a/12646864
    shuffleArray(array: string[]) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }

        return array;
    }

    addStyle(stylesheetId: string, styleString: string) {
        /* Adds a stylesheet with id={styleSheetId} and contents {styleString}.
        * If a stylesheet with that id exists, overwrites it. */
        this.maybeRemoveStyle(stylesheetId);
        const style = document.createElement('style');
        style.id = stylesheetId;
        style.textContent = styleString;
        document.head.append(style);
    }

    maybeRemoveStyle(stylesheetId: string): boolean {
        /* If a <style id={stylesheetId}> exists, removes it.
         * Returns whether one was removed or not.
         */
        const existingStyle = document.getElementById(stylesheetId);
        if (existingStyle !== null) {
            existingStyle.remove();
            return true;
        }
        return false;
    }

    componentDidMount() {
        console.log(`Show.componentDidMount (state.formattedCode: ${this.state.formattedCode})`)
        const pre = document.createElement('pre')
        // if userCode is HTML like <html>, it must be escaped to &lt;html&gt; for hljs (even inside <pre> - because what if there were a </pre> inside?)
        // best way to do this seems to be getting the browser to do it
        const temporaryPTag = document.createElement("p")
        temporaryPTag.appendChild(document.createTextNode(this.props.userCode))
        pre.innerHTML = temporaryPTag.innerHTML
        hljs.highlightElement(pre)

        const temporarySpanTag = document.createElement("span")

        // pick out the highlight classes from the generated HTML
        let allClasses = new Set<string>()
        for (let child_level_1 of pre.children) {
            allClasses.add(child_level_1.className)
            for (let child_level_2 of child_level_1.children) {
                if (child_level_2.className !== null) {
                    allClasses.add(child_level_2.className)
                }
            }
        }

        // some classes get `color: inherit;` and we don't want to start modifying those, so filter them out
        let meaningfulClasses = Array.from(allClasses).filter((className) => {
            temporarySpanTag.className = className
            return window.getComputedStyle(temporarySpanTag).getPropertyValue('color') !== 'inherit'
        })

        const colours = ["#f6f3e8", "#656565", "#ffffff", "#f6f3e8", "#f6f3e8", "#343434", "#857b6f", "#384048", "#a0a8b0", "#f6f3e8", "#857b6f", "#e5786d", "#ddaa6f", "#ddaa6f", "#e5786d", "#99968b", "#e5786d", "#cae682", "#8ac6f2", "#95e454", "#92a65e", "#cae682", "#ccaa8f", "#8ac6f2", "#e5786d", "#f6f3e8", "#e7f6da", "#95e454", "#95e454", "#cae682", "#cae682", "#ccaa8f", "#ccaa8f", "#99968b", "#99968b", "#cae682", "#cae682", "#99968b", "#95e454", "#95e454", "#cae682", "#cae682", "#ccaa8f", "#ccaa8f", "#99968b", "#8ac6f2", "#95e454", "#cae682", "#8ac6f2", "#cae682", "#8ac6f2", "#95e454", "#95e454", "#cae682", "#cae682", "#99968b", "#e5786d", "#e5786d", "#95e454", "#2cae682", "#8ac6f2", "#ccaa8f", "#f6f3e8"];
        const secPerColour = 0.5;
        const subPercent = 1 / colours.length;
        const holdPercent = 0.15 * subPercent;
        const fullLen = secPerColour * colours.length;
        const animationStyles = [];

        // some of the text is plain (eg brackets in lisp), but we want to highlight it too
        // so: highlight the root too
        meaningfulClasses = ['hljs', ...meaningfulClasses];

        for (const className of meaningfulClasses) {
            const newClass = `
                .${className}-anim {
                    animation-name: ${className}-keyframes;
                    animation-duration: ${fullLen}s;
                    animation-iteration-count: infinite;
                }
            `;
            const keyframes = [
                `@keyframes ${className}-keyframes {`,
            ];

            const thisColours = this.shuffleArray([...colours]);
            thisColours.push(thisColours[0]);

            for (const [i, colour] of thisColours.entries()) {
                const subPercentStart = i * subPercent;
                const nextPercent = (i+1) * subPercent;
                const start = i === 0 ? 'from' : `${subPercentStart*100}%`;
                const first = subPercentStart + holdPercent;
                const last = nextPercent - holdPercent;
                const end = i == (thisColours.length - 1) ? 'to' : `${nextPercent*100}%`;
                keyframes.push(`${start} { color: ${colour}; }`)
            }

            keyframes.push('}');

            animationStyles.push(newClass);
            animationStyles.push(...keyframes);

            for (const el of pre.querySelectorAll(`.${className}`)) {
                el.classList.add(`${className}-anim`);
            }
            if (pre.classList.contains(className)) {
                pre.classList.add(`${className}-anim`);
            }
        }

        this.addStyle(this.props.animationStylesheetId, animationStyles.join('\n'));
        this.setState((state, props) => ({formattedCode: pre.outerHTML, allClasses: meaningfulClasses}))
    }

    toggle(always_off?: boolean) {
        /* Pause or resume the animations */
        let extraStyle: string[] = [];
        const styleWasRemoved = this.maybeRemoveStyle(this.animationStatusStylesheetId());

        if (!styleWasRemoved && !always_off) {
            // if it didn't exist, then add it, unless 'always_off'
            for (const cls of this.state.allClasses) {
                extraStyle.push(`.${cls} { animation-play-state: paused; }`)
            }
            this.addStyle(this.animationStatusStylesheetId(), extraStyle.join('\n'));
            this.setState((state, props) => {return {currentlyAnimating: false}});
        } else {
            this.setState((state, props) => {return {currentlyAnimating: true}});
        }
    }

    animationStatusStylesheetId() {
        /* ID of the second stylesheet, which controls play/pause state of animations */
        return `${this.props.animationStylesheetId}-animation-status`;
    }

    componentWillUnmount() {
        this.toggle(true)
        this.maybeRemoveStyle(this.animationStatusStylesheetId())
    }

    render() {
        if (this.props.userCode === "" || this.props.userCode === undefined) {
            return (
                <div className="show-lost">
                <h1>Holy dooley!</h1>
            <p>You've wandered into the wrong place.</p>
        <Link to="/">Go back</Link>
                    </div>)
        }
        return (
            // dangerouslySetInnerHTML is OK if you trust hljs with user input, lol
            <div>
                <div className="highlight" dangerouslySetInnerHTML={{__html: this.state.formattedCode}} />
                <StartStopButton onClick={() => this.toggle()} currentlyAnimating={this.state.currentlyAnimating}/>
            </div>
        )
    }

}