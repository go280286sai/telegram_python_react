import React from "react";
import logo from "../assets/img/logo.jpg";
import Head from "./site/head.mjs";
import Footer from "./site/footer.mjs";
import is_auth from "./helps/is_auth.mjs";

export default class About extends React.Component {
    constructor(props) {
        super(props);
        is_auth();
    }

    render() {
        return (
            <div>
                <Head/>
                <div className={'container'}>
                    <div className={'row about body_content'}>
                        <table>
                            <tbody>
                            <tr>
                                <td><img src={logo} alt="logo"/></td>
                                <td>
                                    <h3>Сторчак Александр</h3>
                                    <p>Full Stack Developer</p>
                                    <h3>Контакты</h3>
                                    <p><a href="mailto:go280286sai@gmail.com"> E-mail: go280286sai@gmail.com</a></p>
                                    <p><a href="https://www.linkedin.com/in/go280286sai">linkedin: www.linkedin.com</a>
                                    </p>
                                    <p><a href="https://www.facebook.com">Facebook: https://www.facebook.com</a></p>
                                    <h3>Навыки</h3>
                                    <p>- Языки программирования: PHP, JavaScript, Python</p>
                                    <p>- Фреймворки: Laravel,Nodejs express, React, Flask</p>
                                    <p>- Базы данных: MySQL, MongoDB, Redis</p>
                                    <p>- DevOps: Docker, GitHub, Git</p>
                                </td>
                            </tr>
                            </tbody>

                        </table>
                    </div>
                </div>
                <Footer/>
            </div>
        )
    }
}
