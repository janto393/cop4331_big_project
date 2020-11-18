import React, { useState } from "react";
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

const CreateRecipePage = () =>{

    const [message,setMessage] = useState('');

    const [instructionList, setInstructionList] = useState([]);
    const [ingredientList, setIngredientList] = useState([]);

    const [publicize,setPublicize] = useState(false);
    const isPublicized = () => setPublicize(!publicize);

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
          newRecipe.instructions = instructionList;
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

  // -===== Ingredients Changes =====-
  // handle input change
  const handleIngredientChange = (ing, index) => {
    const { ingred, value } = ing.target;
    const list = [...ingredientList];
    list[index][ingred] = value;
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
    setIngredientList([...ingredientList, { ingredients: "" }]);
  };

  // -===== Instructions Changes =====-
  // handle click event of the Remove button
  const handleRemoveClickIns = index => {
    const list = [...instructionList];
    list.splice(index, 1);
    setInstructionList(list);
  };
  
  // handle click event of the Add button
  const handleAddClickIns = () => {
    setInstructionList([...instructionList, { instructions: "" }]);
  };

    return(
      <div>
        <h1>CreateRecipePage</h1>
        <div className="createRecipe" style={{borderRadius:"10px" }}>
          <Form>

            <Form.Group as={Row} controlId="formHorizontalEmail">
              <Form.Label column = "lg" lg={2}>
                Recipe Title
              </Form.Label>
              <Col lg={9}>
                <Form.Control size="lg" placeholder="Recipe Title" ref={(c) => newRecipe.title = c} />
              </Col>
            </Form.Group>

            <Form.Group as={Row} controlId="formHorizontalPassword">
              <Form.Label column = "lg" sm={2}>
              Instructions
              </Form.Label>
            {instructionList.map((newInstruction,i) => {
                  return(
                      <div key={i}>
                        <Form.Control size="lg" placeholder="Instructions" value={newInstruction} onChange={(newInstruction) => {instructionList[i] = newInstruction}}/>
                        {instructionList.length-1 === i && i !== 0 && <Button variant="primary" onClick={() => handleRemoveClickIns(i)}>Remove</Button>}
                        {instructionList.length-1 === i && <Button variant="primary" onClick={() => handleAddClickIns(i)}>Add</Button>}
                      </div>
                  );
              })}
            </Form.Group>

            <Form.Group as={Row} controlId="formHorizontalPassword">
              <Form.Label column = "lg" sm={2}>
              Ingredients
              </Form.Label>
              <Col lg={4}>
              {ingredientList.map((x,i)=>{
                  return(
                      <div key={i}>                        
                        <Form.Control size="lg" placeholder="Ingredients" value={x.ingredients} onChange={e => handleIngredientChange(e, i)}/>
                        <Form.Control size="lg" placeholder="Quantity" value={x.quantity} onChange={e => handleIngredientChange(e, i)}/>
                        {ingredientList.length-1 === i && i !== 0 && <Button variant="primary" onClick={() => handleRemoveClick(i)}>Remove</Button>}
                        {ingredientList.length-1 === i && <Button  variant="primary" onClick={() => handleAddClick(i)}>Add</Button>}
                      </div>
                  );
              })}
              </Col>
            </Form.Group>

            <Form.Group as={Row} controlId="formHorizontalCheck">
              <Col lg={{ span: 10, offset: 2 }}>
                {/* <Form.Check label="Private" type="switch" size="lg" onClick={isPublicized} ref={(c) => publicRecipe = c}/> */}
              </Col>
            </Form.Group>

            <Form.Group as={Row}>
              <Col sm={{ span: 10, offset: 2 }}>
                <Button type="submit" onClick={addRecipe} >Create</Button>
              </Col>
            </Form.Group>

          </Form>
        </div>
      </div>
    );
};

export default CreateRecipePage;
