import React from "react";
import {Link} from "react-router-dom";
export default function Footer() {
    return (
        <div>
            <div className={'container'}>
                <div className={'row footer'}>
                    <div className={'col-4'}>
                        <div className={'footer_menu'}>
                            <h4>Menu</h4>
                            <ul>
                                <li><Link to={'/telegram'}>Telegram</Link></li>
                                <li><Link to={'/clients'}>Clients</Link></li>
                                <li><Link to={'/posts'}>Posts</Link></li>
                                <li><Link to={'/settings'}>Settings</Link></li>
                                <li><Link to={'/about'}>About</Link></li>
                                <li><Link to={'/contact'}>Contact</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className={'col-4'}>
                        <div className={'footer_menu'}>
                            <h4>Контакты</h4>
                            <p><a href="mailto:go280286sai@gmail.com"> E-mail: go280286sai@gmail.com</a></p>
                            <p><a href="http://www.linkedin.com/in/go280286sai">linkedin: www.linkedin.com</a></p>
                            <p><a href="https://www.facebook.com">Facebook: https://www.facebook.com</a></p>
                        </div>
                    </div>
                    <div className={'col-4'}>
                        <div className={'footer_menu'}>
                            <h4>Subscribe</h4>
                            <form action="" method="post">
                                <input type="text" placeholder="Email"/>
                                <button className={'btn btn-danger'} type="submit">Subscribe</button>
                            </form>
                        </div>
                    </div>
                </div>
                <p>Copyright &copy; 2024. All Rights Reserved.</p>
            </div>
        </div>
    )
}