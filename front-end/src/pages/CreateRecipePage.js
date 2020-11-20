import React, { useState } from "react";
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

const CreateRecipePage = () =>{

    const [message,setMessage] = useState('');

    const [publicize,setPublicize] = useState(true);
    const isPublicized = () => setPublicize(!publicize);

    const [categoryList, setCategoryList] = useState([]);

    const [instructionList, setInstructionList] = useState([{ instruction: "" }]);
    const [ingredientList, setIngredientList] = useState([{ ingredient: "", quantity: 0 }]);

    var _ud = localStorage.getItem('user_data');
    var ud = JSON.parse(_ud);
    var userId = ud.userId;

    var newRecipe = {
      title : "", 
      // isMetric : false,
      publicRecipe : false,
      author : userId,
      categories : [],
      ingredients : [{ingredient:"", quantity: 0}],
      instructions : [],
    };

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
          newRecipe.title = newRecipe.title.value;
          newRecipe.categories = categoryList;
          // newRecipe.isMetric = imperial;
          newRecipe.publicRecipe = publicize;
          newRecipe.ingredients = ingredientList;
          newRecipe.instructions = instructionList;

          console.log(newRecipe);

            const response = await fetch( buildPath('/createRecipe'),
            {method:'POST',body:JSON.stringify(newRecipe),headers:{'Content-Type': 'application/json'}});
            
            var txt = await response.text();
            var res = JSON.parse(await txt);
            console.log(response);

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
    setIngredientList([...ingredientList, { ingredient: "", quantity: 0 }]);
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
                <Form.Check label="Breakfast" type="checkbox" size="lg" onClick={e => checkBox1("breakfast")}/>
                <Form.Check label="Lunch" type="checkbox" size="lg" onClick={e => checkBox2("lunch")}/>
                <Form.Check label="Dinner" type="checkbox" size="lg" onClick={e => checkBox3("dinner")}/>
              </Col>
              <Col lg={5}>
                <Form.Check label="Snacks" type="checkbox" size="lg" onClick={e => checkBox4("snacks")}/>
                <Form.Check label="Deserts" type="checkbox" size="lg" onClick={e => checkBox5("desert")}/>
                <Form.Check label="Drinks" type="checkbox" size="lg" onClick={e => checkBox6("drinks")}/>
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
              </Form.Group>

              <Col lg={{span:10}}>
              {ingredientList.map((x, i) => {
                return (
                  <div key={i}>
                    <Form.Control size="lg" type ="text" name="ingredient" placeholder="Enter Ingredient" value={x.ingredient} onChange={e => handleIngredientChange(e, i)} />
                    <Form.Control type ="number" name="quantity" min={0} max={50} step={0.25} precision={2} placeholder="Enter Numeric Quantity" value={x.quantity} onChange={e => handleIngredientChange(e, i)} />
                    <Form.Control as="select">
                      <option>Select Unit...</option>
                      <option>ml</option>
                      <option>l</option>
                      <option>g</option>
                      <option>kg</option>
                      <option>c</option>
                    </Form.Control>
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
            {/* <div style={{ marginTop: 20 }}>{JSON.stringify(categoryList)}</div> */}
            {/* <div style={{ marginTop: 20 }}>{JSON.stringify(box1)}</div> */}

          </Form>
        </div>
      </div>
    );
};

export default CreateRecipePage;
