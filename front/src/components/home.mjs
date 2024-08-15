import React from "react";
import DOMPurify from 'dompurify';
import {url_path, curr_url} from "./helps/getUrls.mjs";

export default class Home extends React.Component {
    constructor(props) {
        super(props);
        this.login = this.login.bind(this);
        this.url = url_path;
        this.cur_url = curr_url;
    }


    async login() {
        const email = DOMPurify.sanitize(document.getElementById("email").value);
        const password = document.getElementById("password").value;
        const response = await fetch(`${this.url}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        })
        if (response.status === 200) {
            const data = await response.json();
            if (data[0].status === true) {
                localStorage.setItem('token', data[0].token);
                window.location.href = `${this.cur_url}/telegram`;
            } else {
                window.location.href = `${this.cur_url}/telegram/`;
            }
        } else {
            console.error('Failed to fetch messages:', response.statusText);
        }
    }

    render() {
        return (
            <div>
                <div className={'container'}>
                    <div className={'row about body_content'}>
                        <div className="main_login">
                            <form>
                                <div className="mb-3">
                                    <h3>Email address</h3>
                                    <input type="email" className="form-control" id="email"
                                           aria-describedby="emailHelp"/>
                                </div>
                                <div className="mb-3">
                                    <h3>Password</h3>
                                    <input type="password" className="form-control" id="password"/>
                                </div>
                            </form>
                        </div>
                        <div className="main_btn">
                            <button type="button" className="btn btn-primary" onClick={this.login}>Submit</button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}