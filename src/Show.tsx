import React from "react";
import hljs from "highlight.js";
import './Show.css';
import 'highlight.js/styles/nord.css';

export interface ShowProps {
    userCode: string
    onClickReturn: () => void
}

interface ShowState {
    timerId: number | null
    formattedCode: any | null
    allClasses: string[] // all CSS classes to animate (eg "hljs-string")
}

interface StartStopButtonProps {
    onClick: (event: any) => void
    currentlyAnimating: boolean
}

function StartStopButton(props: StartStopButtonProps) {
    return <button onClick={props.onClick} className="startstop">{props.currentlyAnimating ? "Cease" : "Resume"}</button>
}

function change() {/* change classes to make elements change colour */}


export default class Show extends React.Component<ShowProps, ShowState> {
    // this was a function, but I had problems with useEffect calling toggle() in an infinite loop,
    // so switched to a class for the explicit control over componentWillUnmount
    constructor(props: ShowProps) {
        super(props);
        this.state = {timerId: null, formattedCode: null, allClasses: []}
    }

    componentDidMount() {
        console.log(`Show.componentDidMount (state.formattedCode: ${this.state.formattedCode})`)
        const pre = document.createElement('pre')
        // if userCode is HTML like <html>, it must be escaped to &lt;html&gt; for hljs (even inside <pre> - what if there were a </pre> inside?)
        // best way to do this seems to be getting the browser to do it
        const temporaryPTag = document.createElement("p")
        temporaryPTag.appendChild(document.createTextNode(this.props.userCode))
        pre.innerHTML = temporaryPTag.innerHTML
        hljs.highlightElement(pre)

        const temporarySpanTag = document.createElement("span")

        // pick out the highlight classes.
        // some classes get `color: inherit;` and we don't want to start modifying those, so filter them out
        /*
         * <pre>
         *      hljs-meta
         *          hljs-keyword
         *      hljs-tag
         *          (text node)
         *          hljs-name
         *          hljs-attr
         *          hljs-string
         *
         * pre.children
         *      .children
         *
         * naive approach:
         * for child_level_1 in pre.children:
         *      yield child_level_1
         *      for child_level_2 in child_level_1.children:
         *          yield child_level_2
         *
         *
         */
        let allClasses = new Set<string>()
        for (let child_level_1 of pre.children) {
            allClasses.add(child_level_1.className)
            for (let child_level_2 of child_level_1.children) {
                if (child_level_2.className !== null) {
                    allClasses.add(child_level_2.className)
                }
            }
        }

        const meaningfulClasses = Array.from(allClasses).filter((className) => {
            temporarySpanTag.className = className
            return window.getComputedStyle(temporarySpanTag).getPropertyValue('color') !== 'inherit'
        })
        // with this we can find how many CSS classes we need (hence how many colours) and implement change() to start swapping them

        /* on mount: declare --span-tag: #999cba; */

        this.setState((state, props) => ({formattedCode: pre.outerHTML, allClasses: meaningfulClasses}))
        this.toggle()
    }

    assignNewColorsToClasses() {
        /* the things that happen CSS-wise need to be approximately:
         * for each class created by hljs, give it a default colour (is this actually necessary?)
         * ?
         * create --span-name: #colour for each span
         * ?
         * shuffle colours and allocate them to hljs classes
         * ?
         * ... I'm out of brain juice but it's basically the stuff in twinkle_smart.(css|js), just done at a slightly different time as we can create CSS classes and dump them into document.styleSheets
         */
    }

    toggle(always_off?: boolean) {
        if (this.state.timerId !== null || always_off === true) {
            if (this.state.timerId !== null) {
                clearTimeout(this.state.timerId);
            }
            this.setState({timerId: null});
        } else {
            let timerId = setInterval(change, 500) as unknown as number; // this could go really badly but I think it's OK in theory... TS says it returns a NodeJS.Timer but that won't be right
            this.setState({timerId: timerId});
            change(); // do it right now, rather than waiting 500ms for the first one
        }
    }

    componentWillUnmount() {
        this.toggle(true)
    }

    currentlyAnimating() {
        return this.state.timerId !== null;
    }

    render() {
        return (
            // dangerouslySetInnerHTML is OK if you trust hljs with user input, lol
            <div>
                <div className="highlight" dangerouslySetInnerHTML={{__html: this.state.formattedCode}} />
                <button onClick={this.props.onClickReturn}>Go back</button>
                <StartStopButton onClick={() => this.toggle()} currentlyAnimating={this.currentlyAnimating()}/>
            </div>
        )
    }

}