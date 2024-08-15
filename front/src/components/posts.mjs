import React from "react";
import Head from "./site/head.mjs";
import Footer from "./site/footer.mjs";
import DataTable from 'datatables.net-dt';
import is_auth from "./helps/is_auth.mjs";
import getApiPosts from "./helps/getPosts.mjs";
import {url_path, curr_url} from "./helps/getUrls.mjs";
export default class Posts extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            posts: [{
                id: null,
                description: null
            }]
        }
        is_auth();
        this.token = localStorage.getItem("token");
        this.url = url_path;
        this.curr_url = curr_url;
        this.removePost = this.removePost.bind(this);
        this.getPosts = this.getPosts.bind(this);
        this.renderMessage = this.renderMessage.bind(this);
        this.removeAll = this.removeAll.bind(this);
    }

    async getPosts() {
        const messages = await getApiPosts()
        this.setState({posts: messages});
    }

    async componentDidMount() {
        await this.getPosts();
    }

    async componentWillUnmount() {

        let table = new DataTable('#myTable');
        table.destroy();
        new DataTable('#myTable');
    }

    async removePost(id) {
        try {
            const response = await fetch(`${this.url}/posts/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (response.status === 200) {
                await this.getPosts();
            } else {
                console.error('Failed to fetch messages:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    }

    async removeAll() {
        try {
            const data = {
                "target": "all"
            }
            await fetch(`${this.url}/posts/remove`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            await this.getPosts();
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    }

    renderMessage() {
        return (
            <div className="mb-3">
                <div className="clients_control">
                    <button type="button" className="btn btn-warning" style={{marginRight: '10px'}}
                            onClick={() => window.open(`${this.url}/posts/json/${this.token}`, "_blank")}>
                        Save as JSON
                    </button>
                    <button type="button" className="btn btn-danger" onClick={() => this.removeAll()}>Remove all
                    </button>
                </div>
            </div>
        )
    }

    renderClients() {
        const posts = this.state.posts;
        return (
            <div className="clients">
                <h3>Favorite posts list:</h3>
                <table id="myTable" className="display table table-dark table_style">
                    <thead>
                    <tr>
                        <td>Id</td>
                        <td>Description</td>
                        <td>Action</td>
                    </tr>
                    </thead>
                    <tbody>
                    {posts.map((post, index) => (
                        <tr key={index}>
                            <td>{post.id}</td>
                            <td>{post.description}</td>
                            <td>
                                <button type="button" className="btn btn-danger"
                                        onClick={() => this.removePost(post.id)}>Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        )
    }

    render() {
        return (
            <div>
                <Head/>
                <div className={'container '}>
                    <div className={'row about body_content'}>
                        {this.renderClients()}
                        {this.renderMessage()}
                    </div>
                </div>
                <Footer/>
            </div>
        )
    }
}