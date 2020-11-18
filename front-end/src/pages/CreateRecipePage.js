import React, { useState } from "react";
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

const CreateRecipePage = () =>{

    const [message,setMessage] = useState('');

    const [publicize,setPublicize] = useState(true);
    const isPublicized = () => setPublicize(!publicize);

    const [imperial,setImperial] = useState(true);
    const isImperial = () => setImperial(!imperial);


    var newRecipe = {
      title : "", 
      isMetric : false,
      publicRecipe : false,
      author : userId,
      categories : [],
      ingredients : [],
      instructions : [],
    };

    var _ud = localStorage.getItem('user_data');
    var ud = JSON.parse(_ud);
    var userId = ud.userID;

    function buildPath(route)
    {
    // if (process.env.NODE_ENV === 'production') 
    // {
    //     return 'https://' + app_name +  '.herokuapp.com/' + route;
    // }
    // else
    // {        
        return 'http://localhost:5000' + route;
    // }
    }

    const addRecipe = async event => 
    {
      event.preventDefault();

        try
        {
          newRecipe.isMetric = imperial;
          newRecipe.publicRecipe = publicize;
          newRecipe.ingredients = ingredientList;
          newRecipe.ingredients = ingredientList;
          newRecipe.instructions = instructionList;
          console.log(typeof newRecipe.ingredients[0].quantity);
          console.log(newRecipe);

            // const response = await fetch( buildPath('/createRecipe'),
            // {method:'POST',body:JSON.stringify(newRecipe),headers:{'Content-Type': 'application/json'}});
            
            // var txt = await response.text();
            // var res = JSON.parse(txt);
            // console.log(await response.json());

            // if( res.error.length > 0 )
            // {
            //     setMessage( "API Error:" + res.error );
            // }
            // else
            // {
            //     window.location.href = '/createrecipe';
            //     setMessage('Card has been added');
            // }
        }
        catch(e)
        {
            setMessage(e.toString());
        }
  };

  const [instructionList, setInstructionList] = useState([{ instruction: "" }]);
  const [ingredientList, setIngredientList] = useState([{ ingredient: "", quantity: 0 }]);

  // handle input change
  const handleIngredientChange = (e, index) => {
    const { name, value } = e.target;
    const list = [...ingredientList];
    list[index][name] = value;
    setIngredientList(list);
  };

  // handle click event of the Remove button
  const handleRemoveClick = index => {
    const list = [...ingredientList];
    list.splice(index, 1);
    setIngredientList(list);
  };

  // handle click event of the Add button
  const handleAddClick = () => {
    setIngredientList([...ingredientList, { ingredient: "", quantity: 0 }]);
  };

  // handle input change
  const handleInstructionChange = (e, index) => {
    const { name, value } = e.target;
    const list = [...instructionList];
    list[index][name] = value;
    setInstructionList(list);
  };

  // handle click event of the Remove button
  const handleRemoveClickIns = index => {
    const list = [...instructionList];
    list.splice(index, 1);
    setInstructionList(list);
  };

  // handle click event of the Add button
  const handleAddClickIns = () => {
    setInstructionList([...instructionList, { instruction: "" }]);
  };

    return(
      <div>
        <h1>CreateRecipePage</h1>
        <div className="createRecipe" style={{borderRadius:"10px" }}>
          <Form style={{padding:"5%"}}>

            <Form.Group as={Row}>
              <Form.Label column = "lg" lg={2}>
                Recipe Title
              </Form.Label>
              <Col lg={10}>
                <Form.Control required type="text" size="lg" placeholder="Name your Recipe" ref={(c) => newRecipe.title = c} />
              </Col>
            </Form.Group>

            <Form.Group as={Row} controlId="formBasicCheckboxes">
            <Form.Label column = "lg" lg={2}>
                Category
              </Form.Label>
              <Col lg={5}>
                <Form.Check label="Breakfast" type="checkbox" size="lg" />
                <Form.Check label="Lunch" type="checkbox" size="lg" />
                <Form.Check label="Dinner" type="checkbox" size="lg" />
              </Col>
              <Col lg={5}>
                <Form.Check label="Snacks" type="checkbox" size="lg" />
                <Form.Check label="Desserts" type="checkbox" size="lg" />
                <Form.Check label="Drinks" type="checkbox" size="lg" />
              </Col>
              </Form.Group>

            <Form.Group as={Row} controlId="formBasicText">
              <Form.Label column = "lg" sm={2}>
              Instructions
              </Form.Label>
              <Col lg={10}>
              {instructionList.map((x,i) => {
                  return(
                      <div key={i}>
                        <Form.Control type ="text" name="instruction" size="lg" placeholder="Enter Instructions" value={x.instruction} onChange={e => handleInstructionChange(e,i)}/>
                        {instructionList.length - 1 === i && i !== 0 && <Button onClick={() => handleRemoveClickIns(i)}>Remove</Button>}
                        {instructionList.length - 1 === i && <Button onClick={handleAddClickIns}>Add</Button>}
                      </div>
                  );
              })}
              </Col>
            </Form.Group>

            <Form.Group as={Row} controlId="formBasicText">
            <Form.Group as={Col} controlId="formBasicSwitch">
              <Form.Label column = "lg" lg={2}>
              Ingredients
              </Form.Label>
              <Col lg={2}>
              <Form.Check label="Imperial Units" type="switch" size="lg" onClick={isImperial}/>
              </Col>
              </Form.Group>

              <Col lg={{span:10}}>
              {ingredientList.map((x, i) => {
                return (
                  <div key={i}>
                    <Form.Control type ="text" name="ingredient" placeholder="Enter Ingredient" value={x.ingredient} onChange={e => handleIngredientChange(e, i)} />
                    <Form.Control type ="number" name="quantity" min={0} max={50} step={0.25} precision={2} placeholder="Enter Numeric Quantity" value={x.quantity} onChange={e => handleIngredientChange(e, i)} />
                    {ingredientList.length - 1 === i && i !== 0 && <Button onClick={() => handleRemoveClick(i)}>Remove</Button>}
                    {ingredientList.length - 1 === i && <Button onClick={handleAddClick}>Add</Button>}
                  </div>
                );
              })}
              <Form.Group as={Row} controlId="formBasicCheck">
                <Col lg={{ span: 10}}>
                <Form.Check label="Private Recipe" type="switch" size="lg" onClick={isPublicized}/>
                </Col>
              </Form.Group>
            </Col>
            </Form.Group>


            <Form.Group as={Row}>
              <Col sm={{ span: 10, offset: 2 }}>
                <Button type="submit" onClick={addRecipe} >Create</Button>
              </Col>
            </Form.Group>
            {/* <div style={{ marginTop: 20 }}>{JSON.stringify(instructionList)}</div> */}
            {/* <div style={{ marginTop: 20 }}>{JSON.stringify(ingredientList)}</div> */}

          </Form>
        </div>
      </div>
    );
};

export default CreateRecipePage;
