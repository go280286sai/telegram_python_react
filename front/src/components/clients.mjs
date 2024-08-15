import React from "react";
import Head from "./site/head.mjs";
import Footer from "./site/footer.mjs";
import DataTable from 'datatables.net-dt';
import is_auth from "./helps/is_auth.mjs";
import getApiUsers from "./helps/getUsers.mjs";
import {url_path, curr_url} from "./helps/getUrls.mjs";
export default class Clients extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            clients: [{
                id: null,
                name: null
            }]
        }
        is_auth()
        this.token = localStorage.getItem("token")
        this.url = url_path;
        this.curr_url = curr_url;
        this.removeUser = this.removeUser.bind(this);
        this.getUsers = this.getUsers.bind(this);
        this.removeAll = this.removeAll.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
        this.renderMessage = this.renderMessage.bind(this);
        this.setCleanMessage = this.setCleanMessage.bind(this);
    }

    async componentDidMount() {
        await this.getUsers();
    }

    async componentWillUnmount() {
        let table = new DataTable('#myTable');
        table.destroy();
        new DataTable('#myTable');
    }

    async getUsers() {
        const messages = await getApiUsers();
        this.setState({clients: messages});
    }

    async removeUser(id) {
        try {
            const response = await fetch(`${this.url}/users/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (response.status === 200) {
                await this.getUsers();
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
            await fetch(`${this.url}/users/remove`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    method: 'POST',
                    body: JSON.stringify(data),

                });
            await this.getUsers();
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    }

    async sendMessage() {
        const text = document.querySelector('#editor').value;
        const clients = this.state.clients;
        for (let i = 0; i < clients.length; i++) {
            let client = clients[i];
            if (client.name !== null) {
                try {
                    const body = {
                        "group_id": client.id.toString(),
                        "message": text
                    };
                    await fetch(`${this.url}/send_message`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(body)
                    });
                } catch (error) {
                    console.error('Error fetching messages:', error);
                }
            }
        }
        this.setCleanMessage();
    }

    setCleanMessage() {
        document.querySelector('#editor').value = '';
    }

    renderMessage() {
        return (
            <div className="mb-3">
                <div className="clients_control">
                    <button type="button" className="btn btn-warning" style={{marginRight: '10px'}}
                            onClick={() => window.open(`${this.url}/users/json/${this.token}`, "_blank")}>
                        Save as JSON
                    </button>
                    <button type="button" className="btn btn-danger" onClick={() => this.removeAll()}>Remove all
                    </button>
                </div>
                <h2>Text message</h2>
                <textarea cols='40' rows='10' className="form-control editor" id="editor"/>
                <div style={{marginTop: '10px'}}>
                    <button type="submit" className="btn btn-warning" style={{marginRight: '10px'}}
                            onClick={() => this.setCleanMessage()}>Clean
                    </button>
                    <button type="submit" className="btn btn-primary" onClick={() => this.sendMessage()}>Submit</button>
                </div>

            </div>
        )
    }

    renderClients() {
        const users = this.state.clients;
        return (
            <div className="clients">
                <h3>Users list</h3>
                <table id="myTable" className="display table table-dark table_style">
                    <thead>
                    <tr>
                        <td>Name</td>
                        <td>Id</td>
                        <td>Action</td>
                    </tr>
                    </thead>
                    <tbody>
                    {users.map((user, index) => (
                        <tr key={index}>
                            <td>{user.name}</td>
                            <td>{user.id}</td>
                            <td>
                                <button type="button" className="btn btn-danger"
                                        onClick={() => this.removeUser(user.id)}>Delete
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