import React from "react";
import './Form.css';
import raw from 'raw.macro';

export interface FormProps {
    /* These two form a React-y pattern: the user types code or uses an example, onUserCodeChange changes the App's state,
    then that state becomes Form.props.userCode and changes the textarea's contents. Apparently that's good */
    userCode: string // the current code input by the user
    onUserCodeChange: (userCode: string) => void, // what to do when the user changes the textarea (or types one character... ಠ_ಠ)
    /* this one's just a callback for once the user clicks submit */
    codeWasSubmitted: () => void,
}

const example1 = raw('./samples/example1.txt');
const example2 = raw('./samples/example2.txt');
const example3 = raw('./samples/example3.txt');

export default function Form(props: FormProps) {
    /* A full-page form prompting the user to enter some code.
     * Includes some examples to save them finding their own.
     */

    function handleClickSubmit(event: React.FormEvent) {
        /* Submit the new code, unless it's blank */
        event.preventDefault();
        props.codeWasSubmitted();
    }

    function setCodeInput(text: string) {
        /* For the example buttons. Set the user code input to the string.
        * This creates a new function with 'text' enclosed so that we can pass this straight to onClick. */
        return (e: React.MouseEvent<HTMLButtonElement>) => {
            props.onUserCodeChange(text);
            e.preventDefault();
        }
    }

    return <form onSubmit={handleClickSubmit} id="form">
        <label htmlFor="code"><h1>What code do you want to sparkle?</h1></label>
        <div id="examples">
            <button onClick={setCodeInput(example1)}>Example 1</button>
            <button onClick={setCodeInput(example2)}>Example 2</button>
            <button onClick={setCodeInput(example3)}>Example 3</button>
        </div>
        <textarea id="code" name="code" autoFocus spellCheck="false"
                  value={props.userCode}
                  onChange={(e) => {props.onUserCodeChange(e.target.value)}}
                  placeholder="# Don't put confidential code into text boxes on the internet" />
        <p id="theme-attribution">These colours come from the emacs <a
            href="https://github.com/emacs-mirror/emacs/blob/master/etc/themes/wombat-theme.el">wombat</a> theme.</p>
        <input type="submit" value="Submit"/>
    </form>
};
