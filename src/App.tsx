import React, {useState} from 'react';
import Form from './Form';
import Show from './Show';
import './App.css';
import {Routes, Route, useNavigate} from "react-router-dom";

function App() {
  const [userCode, setUserCode] = useState<string>("");
  const navigate = useNavigate();
  function onCodeSubmitted(code: string) {setUserCode(code); navigate('/show')}

    return (
        <Routes>
            <Route path="/" element={<Form codeWasSubmitted={onCodeSubmitted} userCode={userCode}/>}/>
            <Route path="show" element={<Show userCode={userCode} animationStylesheetId="animations"/>}/>
        </Routes>
        /* something to note about routes: Cloudfront is configured to redirect stuff that looks like a route back to the root of the app.
        * (specifically: URI matches '^/twinkler/.+' but not '^/twinkler/.+\.(js|css|png)$')
        * this is because in normal usage, react-router will push eg /twinkler/show to history, but that will never reach CF...
        * ... but if the user reloads the page (⌘+R, restarting their browser, etc) it'll ping CF with that URI
        * ... which will try to load /twinkler/show/index.html from S3, obviously fail
        * ... and return CF's standard 404 page. not the app itself.
        *     this wouldn't be improved by overriding default behaviour and trying to load /twinkler/show instead
        *     (as that's not an object so 404s too).
        *     one possible solution: get cloudfront to serve /twinkler/index.html
        *     and tell the app "hey go to /twinkler/show". that's kind of the dream; dunno if it's possible.
        * so the "eh, whatever" solution is to restart the app (using browser cache if applicable).
        * there's no specific code in this codebase to handle this - just something to be aware of with its production environment.
        * also the lambda's code isn't infrastructure-as-code and lives exclusively in the AWS dashboard. fight me.
        *  */
    );
}

export default App;
