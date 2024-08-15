import React from "react";
import Head from "./site/head.mjs";
import Footer from "./site/footer.mjs";
import is_auth from "./helps/is_auth.mjs";
import getApiUsers from "./helps/getUsers.mjs";
import getApiPosts from "./helps/getPosts.mjs";
import dompurify from 'dompurify';
import {url_path} from "./helps/getUrls.mjs";

export default class Telegram extends React.Component {
    constructor(props) {
        super(props);
        is_auth();
        this.state = {
            groups: [],
            messages: [
                {
                    id: null,
                    text: null,
                    sender_id: null,
                    message_id: null
                }
            ],
            search: [],
            search_status: false,
            selectedGroup: null,
            group_status: false,
            message_status: false,
            clients: [{
                id: null,
                name: null
            }],
            posts: [{
                id: null,
                description: null
            }]
        };
        this.url = url_path;
        this.token = localStorage.getItem("token");
        this.getGroups = this.getGroups.bind(this);
        this.getMessages = this.getMessages.bind(this);
        this.getSearch = this.getSearch.bind(this);
        this.getUsers = this.getUsers.bind(this);
        this.getPosts = this.getPosts.bind(this);
    }

    async componentDidMount() {
        await this.getUsers();
        await this.getPosts();
    }

    async getUsers() {
        const messages = await getApiUsers()
        this.setState({clients: messages});
    }

    async getPosts() {
        const messages = await getApiPosts();
        this.setState({posts: messages});
    }

    async getGroups() {
        try {
            const response = await fetch(`${this.url}/get_groups/${this.token}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (response.status === 200) {
                const groups = await response.json();
                this.setState({groups});
            } else {
                console.error('Failed to fetch groups:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching groups:', error);
        }
        this.setState({group_status: true});
        this.setState({message_status: false});
        this.setState({search_status: false});
    }

    async getMessages(groupId) {
        try {
            const response = await fetch(`${this.url}/get_messages/${groupId}/${this.token}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (response.status === 200) {
                const messages = await response.json();
                console.log(messages)
                this.setState({messages, selectedGroup: groupId});
            } else {
                console.error('Failed to fetch messages:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
        this.setState({group_status: false});
        this.setState({message_status: true});
        this.setState({search_status: false});

    }

    async getSearch() {
        const text = dompurify.sanitize(document.getElementById("search").value);
        try {
            const response = await fetch(`${this.url}/get_search/${text}/${this.token}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (response.status === 200) {
                const messages = await response.json();
                console.log(messages);
                this.setState({search: messages});
            } else {
                console.error('Failed to fetch messages:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
        this.setState({group_status: false});
        this.setState({message_status: false});
        this.setState({search_status: true});
    }

    async addClient(name, id) {
        const body = {
            "name": name,
            "id": id
        };
        try {
            await fetch(`${this.url}/users`, {
                method: 'POST',
                body: JSON.stringify(body),
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            await this.getUsers();
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    }

    async addPost(text, id) {
        const body = {
            "id": id,
            "description": text
        };
        try {
            await fetch(`${this.url}/posts`, {
                method: 'POST',
                body: JSON.stringify(body),
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            await this.getPosts();
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    }

    async removeUser(id) {
        try {
            await fetch(`${this.url}/users/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            await this.getUsers();
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    }

    async removePost(id) {
        try {
           await fetch(`${this.url}/posts/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            await this.getPosts();
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    }

    renderSearchMessages() {
        const search_messages = this.state.search;
        const clients = this.state.clients;
        const posts = this.state.posts;
        if (search_messages.length === 0) {
            return <p>No groups available.</p>;
        }
        return (
            <div>
                <h3>Messages list:</h3>
                {search_messages.map((message, index) => (
                    (message.message !== null ?
                        (<div key={index}>
                            <p>Sender_id: {message.sender_id}</p>
                            <p>name: {message.user.name}</p>
                            <p>Message_id: {message.message_id}</p>
                            <p>{message.message}</p>
                            <p id="group_data">{message.date}</p>
                            {clients.find(client => client.id === message.sender_id) ? (
                                <p>
                                    <button className="btn btn-danger"
                                            onClick={() => this.removeUser(message.sender_id)}>
                                        Remove client
                                    </button>
                                </p>
                            ) : (
                                <p>
                                    <button className="btn btn-success"
                                            onClick={() => this.addClient(message.user.name, message.sender_id)}>
                                        Add client
                                    </button>
                                </p>
                            )}

                            {posts.find(post => post.id === message.message_id) ? (
                                <p>
                                    <button className="btn btn-danger"
                                            onClick={() => this.removePost(message.message_id)}>
                                        Remove from favorites
                                    </button>
                                </p>
                            ) : (
                                <p>
                                    <button className="btn btn-success"
                                            onClick={() => this.addPost(message.message, message.message_id)}>
                                        Add to favorites
                                    </button>
                                </p>
                            )}
                            <div className="message_block">&nbsp;</div>
                        </div>) : null)
                ))}
            </div>
        );
    }

    renderGroups() {
        const {groups} = this.state;
        if (groups.length === 0) {
            return <p>No groups available.</p>;
        }
        let i = 0;
        return (
            <table className="table">
                <thead>
                <tr className="table-dark">
                    <th>Index</th>
                    <th>Name</th>
                    <th>ID</th>
                </tr>
                </thead>
                <tbody>
                {groups.map((group, index) => (
                    (i++ === group.index ? (
                        <tr key={group.id}>
                            <td>{index}</td>
                            <td>
                                <strong
                                    id="group_a"
                                    onClick={() => this.getMessages(group.id)}
                                >
                                    {group.name}
                                </strong>
                            </td>
                            <td>{group.id}</td>
                        </tr>
                    ) : null)
                ))}
                </tbody>
            </table>
        );
    }

    renderMessages() {
        const {messages, selectedGroup} = this.state;
        const clients = this.state.clients;
        const posts = this.state.posts;
        if (!selectedGroup) {
            return null;
        }
        const messages_count = messages.length;
        if (messages_count === 0) {
            return <p>No messages available for this group.</p>;
        }
        return (
            <div>
                <h3>Messages list:</h3>
                {messages.map((message, index) => (
                    message.message !== null ? (
                        <div key={index}>
                            <p>Sender_id: {message.sender_id}</p>
                            <p>name: {message.user.name}</p>
                            <p>{message.message}</p>
                            <p id="group_data">{message.date}</p>
                            {clients.find(client => client.id === message.sender_id) ? (
                                <p>
                                    <button className="btn btn-danger"
                                            onClick={() => this.removeUser(message.sender_id)}>
                                        Remove client
                                    </button>
                                </p>
                            ) : (
                                <p>
                                    <button className="btn btn-success"
                                            onClick={() => this.addClient(message.user.name, message.sender_id)}>
                                        Add client
                                    </button>
                                </p>
                            )}

                            {posts.find(post => post.id === message.message_id) ? (
                                <p>
                                    <button className="btn btn-danger"
                                            onClick={() => this.removePost(message.message_id)}>
                                        Remove from favorites
                                    </button>
                                </p>
                            ) : (
                                <p>
                                    <button className="btn btn-success"
                                            onClick={() => this.addPost(message.message, message.message_id)}>
                                        Add to favorites
                                    </button>
                                </p>
                            )}
                            <div className="message_block">&nbsp;</div>
                        </div>
                    ) : null
                ))}
            </div>
        );
    }

    render() {
        return (
            <div>
                <Head/>
                <div className="container">
                    <div className="row about body_content">
                        <div className="commands">
                            <table>
                                <tbody>
                                <tr>
                                    <td>
                                        <button className="btn btn-primary" onClick={this.getGroups}>
                                            Get groups
                                        </button>
                                    </td>
                                    <td>
                                        <button className="btn btn-primary" onClick={this.getSearch}>Search</button>
                                        <input type="text" id="search"/>
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                        <div id="content">
                            {(this.state.group_status ? (this.renderGroups()) : null)}
                            {(this.state.message_status ? (this.renderMessages()) : null)}
                            {(this.state.search_status ? (this.renderSearchMessages()) : null)}
                        </div>
                    </div>
                </div>
                <Footer/>
            </div>
        );
    }
}
