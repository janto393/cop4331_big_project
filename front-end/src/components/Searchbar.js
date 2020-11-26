// React imports
import React from 'react';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';

class Searchbar extends React.Component
{
	constructor()
	{
		super();
		this.state = {
			title : '',
			criteria : ''
		};
	}

	componentDidMount()
	{

	}

	render()
	{
		return (
			<div className="searchbar-div">
				<Form>
					<Form.Row>
						<Col>
							<Form.Control id="title-search" type="text" placeholder="Search by Title" />
						</Col>
						<Col>
							<Form.Control id="category-search" type="text" placeholder="Search by Category" />
						</Col>
					</Form.Row>
				</Form>
			</div>
		);
	}
}

export default Searchbar;
