import React from 'react';
import CardDeck from 'react-bootstrap/CardDeck';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';


function CardUI()
{
  var userData = JSON.parse(localStorage.getItem('user_data'));
	// var card = '';
	// var search = '';

	// const [message,setMessage] = useState('');
	// const [searchResults,setResults] = useState('');
	// const [cardList,setCardList] = useState('');

	// const addCard = async event => 
	// {
	// 	event.preventDefault();
	// 	alert('addCard() ' + card.value);
	// };

	// const searchCard = async event => 
	// {
	// 	event.preventDefault();
	// 	alert('searchCard() ' + search.value);
	// };

	const cardInfo = [
		{
			image:"",
			title:"Recipe title",
			text:"instructions"
		},
		{
			image:"",
			title:"Recipe title",
			text:"instructions"
		},
		{
			image:"",
			title:"Recipe title",
			text:"instructions"
		},
		{
			image:"",
			title:"Recipe title",
			text:"instructions"
		},
		{
			image:"",
			title:"Recipe title",
			text:"instructions"
		},
		{
			image:"",
			title:"Recipe title",
			text:"instructions"
		}
	];

	const renderCard = (card, index) => {
		return(
			<Card border="danger" style={{ width: '18rem' }} key = {index} >
				<Card.Img variant="top" src={card.image} />
				<Card.Body>
				<Card.Title>{card.title}</Card.Title>
				<Card.Text>{card.text}</Card.Text>
				</Card.Body>
				<Card.Footer>
				<Button variant = "danger">View</Button>
				</Card.Footer>
			</Card>
		);
	};

	return(
		<div id="cardUIDiv">
			{/* <CardDeck> */}
			{cardInfo.map(renderCard)}
			{/* </CardDeck> */}
		</div>
	);
}

export default CardUI;
