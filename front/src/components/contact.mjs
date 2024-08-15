import React from "react";
import Head from "./site/head.mjs";
import Footer from "./site/footer.mjs";
import ClassicEditor from '../assets/css/ckeditor5/build/ckeditor.js';
import is_auth from "./helps/is_auth.mjs";

export default class Contact extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            status: false
        }
        is_auth();
    }

    componentDidMount() {
        if (this.state.status === false) {
            ClassicEditor.create(document.querySelector('#editor')).catch(err => console.log(err));
            this.state.status = true
        }
    }

    render() {
        return (
            <div>
                <Head/>
                <div className={'container '}>
                    <div className={'row about body_content'}>
                        <div className={'contact'}>
                            <form>
                                <div className="mb-3">
                                    <label htmlFor="title" className="form-label">Title</label>
                                    <input type="text" className="form-control" id="title"
                                           aria-describedby="titleHelp"/>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label">Email address</label>
                                    <input type="email" className="form-control" id="email"
                                           aria-describedby="emailHelp"/>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="editor2" className="form-label">Text message</label>
                                    <textarea cols='40' rows='10' className="form-control" id='editor' name='content'/>
                                </div>
                                <button type="submit" className="btn btn-primary">Submit</button>
                            </form>
                        </div>
                    </div>
                </div>
                <Footer/>
            </div>)
    }
}
