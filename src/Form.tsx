import React, {useState} from "react";
import './Form.css';
import raw from 'raw.macro';

export interface FormProps {
    codeWasSubmitted: (userCode: string) => void, // What to do when the user clicks submit
    userCode: string // may be empty
}

const example1 = raw('./samples/example1.txt');
const example2 = raw('./samples/example2.txt');
const example3 = raw('./samples/example3.txt');

export default function Form(props: FormProps) {
    /* A full-page form prompting the user to enter some code.
     * Includes some examples to save them finding their own.
     */
    function handleClickSubmit(event: React.FormEvent) {
        if (userCode !== null && userCode !== "") {
            props.codeWasSubmitted(userCode);
        }
        event.preventDefault();
    }

    function handleClickExample(example: string) {
        return (e: React.SyntheticEvent<HTMLButtonElement>) => {
            setUserCode(example)
            e.preventDefault()
        }
    }

    const [userCode, setUserCode] = useState<string>(props.userCode);

    return <form onSubmit={handleClickSubmit} id="form">
        <label htmlFor="code"><h1>What code do you want to sparkle? ✨</h1></label>
        <p>These colours come from the emacs <a
            href="https://github.com/emacs-mirror/emacs/blob/master/etc/themes/wombat-theme.el">wombat</a> theme.</p>
        <div id="examples">
            <button onClick={handleClickExample(example1)}>Example 1</button>
            <button onClick={handleClickExample(example2)}>Example 2</button>
            <button onClick={handleClickExample(example3)}>Example 3</button>
        </div>
        <textarea id="code" name="code" autoFocus spellCheck="false"
                  value={userCode}
                  placeholder="# Don't put confidential code into text boxes on the internet" />
        <input type="submit" value="Submit"/>
    </form>
};