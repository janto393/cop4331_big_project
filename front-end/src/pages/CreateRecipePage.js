import React, { useState } from "react";
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

// Script includes
import uploadImage from '../scripts/uploadImage';

// jwt imports
import jwt_decode from 'jwt-decode';

import buildPath from '../scripts/buildPath';

const CreateRecipePage = () =>{

    const [message,setMessage] = useState('');

    const [publicize,setPublicize] = useState(true);
    const isPublicized = () => setPublicize(!publicize);

    const [categoryList, setCategoryList] = useState([]);

    const [instructionList, setInstructionList] = useState([{ instruction: "" }]);
		const [ingredientList, setIngredientList] = useState([{ ingredient: "", quantity: 0, unit: "" }]);
		
		const [recipeCoverImage, setRecipeCoverImage] = useState({file : null});

    var _ud = localStorage.getItem('user_data');
    var ud = JSON.parse(_ud);
    var userId = ud.userID;
    var metric = ud.usesMetric;

    var newRecipe = {
      title : "",
      isMetric : metric,
      picture : "", 
      publicRecipe : false,
      author : userId,
      categories : [],
      ingredients : [{ingredient:"", quantity: 0, unit: ""}],
      instructions : [],
    };

    const addRecipe = async event => 
    {
			event.preventDefault();

      newRecipe.title = newRecipe.title.value;
      newRecipe.categories = categoryList;
      newRecipe.publicRecipe = publicize;
      newRecipe.ingredients = ingredientList;
      newRecipe.instructions = instructionList;

      if (newRecipe.title === '')
      {
        setMessage('Title is required');
        return;
      }
      else if (newRecipe.categories.length === 0)
      {
        setMessage('Please select at least one Category');
        return;
      }
      else if (newRecipe.ingredients.length === 0)
      {
        setMessage('Please select at least one Category');
        return;
      }
      for(var i = 0 ; i < newRecipe.instructions.length; i++)
      {
        if(newRecipe.instructions[i].instruction === "")
        {
          setMessage('Please input missing Instruction');
          return;
        }
      }
      for(i = 0 ; i < newRecipe.ingredients.length; i++)
      {
        if(newRecipe.ingredients[i].ingredient === "")
        {
          setMessage('Please input missing Ingredient');
          return;
        }
        if(newRecipe.ingredients[i].unit === "")
        {
          setMessage('Please select a Unit');
          return;
        }
			}
			
			if (recipeCoverImage.file === null)
			{
				setMessage('Please select an image');
				return;
			}

			var uploadResponse = uploadImage(recipeCoverImage.file);

			if (uploadResponse.success)
			{
				newRecipe.picture = uploadResponse.uri;
			}
			else
			{
				setMessage('Failed to upload image, please try agian');
				return;
			}

      try
      {
				const response = await fetch( buildPath('/api/createRecipe'),
				{method:'POST',body:JSON.stringify(newRecipe),headers:{'Content-Type': 'application/json'}});
				
				var txt = await response.text();
				var res = JSON.parse(txt);

				// decode the jwt
				res = jwt_decode(res);

				if( res.error.length > 0 )
				{
					setMessage( "API Error:" + res.error );
				}
				else
				{
					window.location.href = '/createrecipe';
          setMessage('Card has been added');
          
				}
			}
			catch(e)
			{
        setMessage(e.toString());
			}
  };
  
  // handle checkboxes
  const [box1,setCheckBox1] = useState(true);
    const checkBox1 = (value) => {
      setCheckBox1(!box1);
      const list = [...categoryList];
      if(box1 === false){
        var i = categoryList.indexOf(value);
        list.splice(i,1);
      }
      else{
        list.push(value);
      }
      setCategoryList(list);
    };
    const [box2,setCheckBox2] = useState(true);
    const checkBox2 = (value) => {
      setCheckBox2(!box2);
      const list = [...categoryList];
      if(box2 === false){
        var i = categoryList.indexOf(value);
        list.splice(i,1);
      }
      else{
        list.push(value);
      }
      setCategoryList(list);
    };
    const [box3,setCheckBox3] = useState(true);
    const checkBox3 = (value) => {
      setCheckBox3(!box3);
      const list = [...categoryList];
      if(box3 === false){
        var i = categoryList.indexOf(value);
        list.splice(i,1);
      }
      else{
        list.push(value);
      }
      setCategoryList(list);
    };
    const [box4,setCheckBox4] = useState(true);
    const checkBox4 = (value) => {
      setCheckBox4(!box4);
      const list = [...categoryList];
      if(box4 === false){
        var i = categoryList.indexOf(value);
        list.splice(i,1);
      }
      else{
        list.push(value);
      }
      setCategoryList(list);
    };
    const [box5,setCheckBox5] = useState(true);
    const checkBox5 = (value) => {
      setCheckBox5(!box5);
      const list = [...categoryList];
      if(box5 === false){
        var i = categoryList.indexOf(value);
        list.splice(i,1);
      }
      else{
        list.push(value);
      }
      setCategoryList(list);
    };
    const [box6,setCheckBox6] = useState(true);
    const checkBox6 = (value) => {
      setCheckBox6(!box6);
      const list = [...categoryList];
      if(box6 === false){
        var i = categoryList.indexOf(value);
        list.splice(i,1);
      }
      else{
        list.push(value);
      }
      setCategoryList(list);
    };

  // handle ingredients
  const handleIngredientChange = (e, index) => {
    const { name, value } = e.target;
    const list = [...ingredientList];
    list[index][name] = value;
    setIngredientList(list);
  };
  const handleRemoveClick = index => {
    const list = [...ingredientList];
    list.splice(index, 1);
    setIngredientList(list);
  };
  const handleAddClick = () => {
    setIngredientList([...ingredientList, { ingredient: "", quantity: 0, unit: "" }]);
  };

  // handle instructions
  const handleInstructionChange = (e, index) => {
    const { name, value } = e.target;
    const list = [...instructionList];
    list[index][name] = value;
    setInstructionList(list);
  };
  const handleRemoveClickIns = index => {
    const list = [...instructionList];
    list.splice(index, 1);
    setInstructionList(list);
  };
  const handleAddClickIns = () => {
    setInstructionList([...instructionList, { instruction: "" }]);
	};

	// handle picture upload
	const handlePictureUpload = (e) => {
		setRecipeCoverImage({file : e.target.files[0]});
	};

	return(
		<div>
			<div className="createRecipe" style={{borderRadius:"2%"}}>
				<Form style={{padding:"10%"}}>
				<h1>Create Recipe</h1><br/>
					<Form.Row>
						<Form.Group as={Col}>
							<Form.Label>
								Recipe Title
							</Form.Label>
							<Col>
								<Form.Control required type="text" size="lg" placeholder="Name your Recipe" ref={(c) => newRecipe.title = c} />
							</Col>
						</Form.Group>

						<Form.Group  as={Col}>
							<Form.Label>
								Recipe Picture
							</Form.Label>
							<Form.File required id="recipeImageUpload" onChange={handlePictureUpload} />
						</Form.Group>
					</Form.Row>

					<Form.Row>
						<Form.Group as={Col}>
							<Form.Label>
								Category
							</Form.Label>
							<Form.Group as={Row}>
								<Form.Group as={Col}>
									<Form.Check label="Breakfast" type="checkbox" onClick={e => checkBox1("breakfast")}/>
								</Form.Group>

								<Form.Group as={Col}>
									<Form.Check label="Lunch" type="checkbox" onClick={e => checkBox2("lunch")}/>
								</Form.Group>

								<Form.Group as={Col}>
									<Form.Check label="Dinner" type="checkbox" onClick={e => checkBox3("dinner")}/>
								</Form.Group>

								<Form.Group as={Col}>
									<Form.Check label="Snacks" type="checkbox" onClick={e => checkBox4("snacks")}/>
								</Form.Group>

								<Form.Group as={Col}>
									<Form.Check label="Desserts" type="checkbox" onClick={e => checkBox5("desert")}/>
								</Form.Group>

								<Form.Group as={Col}>
									<Form.Check label="Drinks" type="checkbox" onClick={e => checkBox6("drinks")}/>
								</Form.Group>
							</Form.Group>
						</Form.Group>
					</Form.Row>

					<Form.Row>
						<Form.Group as={Col}>
							<Form.Label>
							Instructions
							</Form.Label>
							{instructionList.map((x,i) => {
									return(
											<Form.Group as={Row} key={i}>
												<Form.Group as={Col}>
													<Form.Control type ="text" name="instruction" size="lg" placeholder="Enter Instructions" value={x.instruction} onChange={e => handleInstructionChange(e,i)}/>
													{instructionList.length - 1 === i && i !== 0 && <Button variant="danger" style={{margin:"0.4%"}} onClick={() => handleRemoveClickIns(i)}>Remove</Button>}
													{instructionList.length - 1 === i && <Button style={{margin:"0.4%"}}onClick={handleAddClickIns}>Add</Button>}
												</Form.Group>
											</Form.Group>

									);
							})}
						</Form.Group>
					</Form.Row>

					<Form.Row>
						<Form.Group as={Col}>
							<Form.Label>
							Ingredients
							</Form.Label>
							
								{ingredientList.map((x, i) => {
									return (
										<Form.Group as={Row} key={i}>
											<Form.Group as={Col}>
												<Form.Control size="lg" type ="text" name="ingredient" placeholder="Enter Ingredient" value={x.ingredient} onChange={e => handleIngredientChange(e, i)} />
												{ingredientList.length - 1 === i && i !== 0 && <Button variant="danger" style={{margin:"1%"}} onClick={() => handleRemoveClick(i)}>Remove</Button>}
												{ingredientList.length - 1 === i && <Button style={{margin:"1%"}} onClick={handleAddClick}>Add</Button>}
											</Form.Group>

											<Form.Group as={Col}>
												<Form.Control size="lg" type ="number" name="quantity" min={0} max={50} step={0.25} precision={2} placeholder="Enter Numeric Quantity" value={x.quantity} onChange={e => handleIngredientChange(e, i)} />
											</Form.Group>

											<Form.Group as={Col}>
													{metric ? 
													<Form.Control size="lg" name="unit" as="select" value={x.unit} onChange={e => handleIngredientChange(e, i) }>
														<option>Select Unit...</option>
														<option>ml</option>
														<option>l</option>
														<option>g</option>
														<option>kg</option></Form.Control> : 
													<Form.Control size="lg" name="unit" as="select" value={x.unit} onChange={e => handleIngredientChange(e, i) }>
														<option>Select Unit...</option>
														<option>lb</option>
														<option>oz</option>
														<option>fl-oz</option>
														<option>cup</option>
														<option>qt</option>
														<option>gal</option>
														<option>tsp</option>
														<option>tbsp</option></Form.Control> }
											</Form.Group>
											
										</Form.Group>
									);
								})}
							</Form.Group>
					</Form.Row>

					<Form.Group as={Row} controlId="formBasicCheck">
								<Col lg={{ span: 10}}>
								<Form.Check label="Private Recipe" type="switch" size="lg" onClick={isPublicized}/>
								</Col>
							</Form.Group>

					<Form.Group>
							<Button style={{padding: "1% 3.5% 1% 3.5%"}}type="submit" variant="success" onClick={addRecipe} >Create</Button>
							<span id="loginResult" className="error-message">{message}</span>
					</Form.Group>
				</Form>
			</div>
		</div>
	);
};

export default CreateRecipePage;
