import React from "react";
import Head from "./site/head.mjs";
import Footer from "./site/footer.mjs";
import is_auth from "./helps/is_auth.mjs";


export default class Settings extends React.Component {
    constructor(props) {
        super(props);
        is_auth();
    }

    render() {
        return (
            <div>
                <Head/>
                <div className={'container '}>
                    <div className={'row about body_content'}>
                        <h2>Возможности системы:</h2>
                        <p>1. Добавлять клиентов в базу даных.</p>
                        <p>2. Добавлять посты в базу даных.</p>
                        <p>3. Делать рассылку сообщений в телеграмме.</p>
                        <p>4. Делать выгрузку клиентов и постов в формате json.</p>
                    </div>
                </div>
                <Footer/>
            </div>
        )
    }
}
