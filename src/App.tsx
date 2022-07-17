import React, {useState} from 'react';
import Form from './Form';
import Show from './Show';
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
    );
}

export default App;
