import React, {useState} from 'react';
import Form from './Form';
import Show from './Show';

enum Mode {
  form,
  show
}

function App() {
  const [mode, setMode] = useState(Mode.form);
  const [userCode, setUserCode] = useState<string>("");
  function switchModeTo(m: Mode) {
    setMode(m);
  }
  function returnContent(code: string) {
    setUserCode(code);
    setMode(Mode.show);
  }

  let inner;

  if (mode === Mode.form) {
    inner = <Form onClickGo={returnContent} userCode={userCode} />
  } else if (mode === Mode.show) {
    inner = <Show onClickReturn={()=>switchModeTo(Mode.form)} userCode={userCode} stylesheetId="yolo-shipit"/>
  }

  return (
    <div className="App">
      <header className="App-header">
        {inner}
      </header>
    </div>
  );
}

export default App;
