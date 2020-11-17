import React, { useState } from "react";
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

const CreateRecipePage = () =>{

  const [instructionList, setInstructionList] = useState([{ instructions: "" }]);
  const [ingredientList, setIngredientList] = useState([{ ingredients: "" }]);

  // -===== Ingredients Changes =====-
  // handle input change
  const handleIngredientChange = (e, index) => {
    const { ingred, value } = e.target;
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
  const handleInstructionChange = (e, index) => {
    const { instruct, value } = e.target;
    const list = [...instructionList];
    list[index][instruct] = value;
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
                <Form.Control size="lg" placeholder="Recipe Title" />
              </Col>
            </Form.Group>
            <Form.Group as={Row} controlId="formHorizontalPassword">
              <Form.Label column = "lg" sm={2}>
              Instructions
              </Form.Label>
              {instructionList.map((x,i)=>{
                  return(
                      <div>
                        <Col lg={9}>
                          <Form.Control size="lg" placeholder="Instructions" value={x.ingredients} onChange={e => handleInstructionChange(e, i)}/>
                        </Col>
                        {instructionList.length !==1 && <Button variant="primary" onClick={() => handleRemoveClickIns(i)}>Remove</Button>}
                        {instructionList.length-1 === i && <Button variant="primary" onClick={() => handleAddClickIns(i)}>Add</Button>}
                      </div>
                  );
              })}
            </Form.Group>

            <Form.Group as={Row} controlId="formHorizontalPassword">
              <Form.Label column = "lg" sm={2}>
              Ingredients
              </Form.Label>
              {ingredientList.map((x,i)=>{
                  return(
                      <div>
                        <Col sm={10}>
                          <Form.Control size="lg" placeholder="Ingredients" value={x.ingredients} onChange={e => handleIngredientChange(e, i)}/>
                        </Col>
                        {ingredientList.length !==1 && <Button variant="primary" onClick={() => handleRemoveClick(i)}>Remove</Button>}
                        {ingredientList.length-1 === i && <Button  variant="primary" onClick={() => handleAddClick(i)}>Add</Button>}
                      </div>
                  );
              })}
            </Form.Group>

            
            <Form.Group as={Row} controlId="formHorizontalCheck">
              <Col lg={{ span: 10, offset: 2 }}>
                <Form.Check label="Private" type="switch" size="lg"/>
              </Col>
            </Form.Group>
            <Form.Group as={Row}>
              <Col sm={{ span: 10, offset: 2 }}>
                <Button type="submit">Create</Button>
              </Col>
            </Form.Group>
          </Form>
        </div>
      </div>
    );
};

export default CreateRecipePage;
