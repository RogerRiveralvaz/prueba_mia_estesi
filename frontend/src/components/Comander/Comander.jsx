import React, { useEffect, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror'
import { dracula } from '@uiw/codemirror-theme-dracula';
import Swal from 'sweetalert2'
import { BsFillSendFill } from "react-icons/bs";
import { FaUpload } from "react-icons/fa";
import { ENDPOINT } from '../../App';

function Comander() {
    const [inputValue, setInputValue] = useState('');
    const [terminalValue, setTerminalValue] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        document.title = "sistema de archivos<";
    }, []);

    useEffect(() => {
        fetch(`${ENDPOINT}/`)
            .then(response => response.text())
            .then(data => setMessage(data));
    }, []);

    useEffect(() => {
        const savedValue = sessionStorage.getItem('terminalValue');
        if (savedValue) {
            setTerminalValue(savedValue);
        }
    }, []);

    useEffect(() => {
        sessionStorage.setItem('terminalValue', terminalValue);
    }, [terminalValue]);

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            handleSubmit();
        }
    };

    async function handleSubmit() {
        if (!inputValue.trim()) {
            Swal.fire({
                title: 'Error',
                text: 'Cadena vacia',
                icon: 'error'
            });
        } else {
            try {
                const response = await fetch(`${ENDPOINT}/command`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        texto: inputValue,
                    }),
                });
                const data = await response.text();
                setTerminalValue(data);
                setInputValue('')
            } catch (error) {
                Swal.fire({
                    title: 'Error',
                    text: 'No se logro analizar el comando',
                    icon: 'error'
                });
                console.log(error);
            }
        }
    }

    const handleFiles = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (event) {
                fetch(`${ENDPOINT}/upload`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        fileContent: event.target.result
                    })
                })
                    .then(response => response.text())
                    .then(data => {
                        setTerminalValue(data);
                    })
                    .catch(error => {
                        Swal.fire({
                            title: 'Error',
                            text: 'No se logro cargar el archivo',
                            icon: 'error'
                        });
                        console.error('Error:', error);
                    });
            };
            reader.readAsText(file);
        }
    };

    return (
        <div className="container-fluid bg-light py-4">
            <div className="container bg-light text-dark py-4 rounded">
                <h1 className="display-4 text-center mb-4">{message}</h1>
                <div className="d-flex">
                    <input
                        type="text"
                        className="form-control flex-grow-1 mr-2"
                        placeholder="Ingresar comando"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <button type="button" onClick={handleSubmit} className="btn btn-primary mr-2"><BsFillSendFill /></button>
                    <label htmlFor="fileInput" className="btn btn-danger mr-2"><FaUpload /> Cargar</label>
                    <input
                        id="fileInput"
                        type="file"
                        onChange={handleFiles}
                        className="d-none"
                    />
                </div>
                <div className="mt-4">
                    <CodeMirror
                        width='100%'
                        height='50vh'
                        readOnly='true'
                        value={terminalValue}
                        theme={dracula}
                    />
                </div>
            </div>
        </div>
    )
}

export default Comander;
