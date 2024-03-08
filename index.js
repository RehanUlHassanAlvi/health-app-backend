// index.js

const express = require('express');
const bodyParser = require('body-parser');
const { sendEmail } = require('./emailSender');
const maleBody = require ('./male_bodyParts.js')
const femaleBody = require ('./female_bodyParts.js')
const treatments=require('./treatments.js')
const treatmentDetails=require('./treatment_details.js')
const cors = require('cors');
const app = express();
const fs = require('fs');
const url = require('url');
const { trace } = require('console');


const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});



const getConcernsForBodyPart= (name,gender)=> {
  if (gender == 1){ //male
  const obj= maleBody.filter(item => item.bodyPartName===name)
    return obj[0].concerns.length>0?obj[0].concerns:[]
  }
  else if (gender ==0 )  //female
  {
    const obj= femaleBody.filter(item => item.bodyPartName===name)
    return obj[0].concerns.length>0?obj[0].concerns:[]
  }
}



const getListOfAllBodyParts= (gender)=>{

  if (gender===1){
    return maleBody.map((bodyPart)=>{
      return bodyPart.bodyPartName
    })
  }
  else if (gender ===0 )
  {
    return femaleBody.map((bodyPart)=>{
     return bodyPart.bodyPartName
    })
  }
}

const getAllBodyPartsAndConcerns = (gender) => {
  if (gender === 'male') {
    return maleBody;
  } else if (gender === 'female') {
    return femaleBody;
  }
};


app.get('/bodyPartsAndConcerns', (req, res) => {
    const gender = req.query.gender;
  
    if (!gender) {
      return res.status(400).json({ error: 'Invalid request. Missing gender parameter.' });
    }
  
    try {
      const treatments = getAllBodyPartsAndConcerns(gender);
      res.json(treatments);
    } catch (error) {
      res.status(400).json({ error: 'Invalid JSON format in selections parameter.' });
    }
  });





  app.post('/send_email', (req, res) => {
    
    const mailObj= req.body;
    
    sendEmail(mailObj);
  
    res.status(200).json({ message: 'Email sent successfully!' });
  });
  

  function removeDuplicateObjects(array) {
    const uniqueObjects = [];
    
    array.forEach(obj => {
      const isDuplicate = uniqueObjects.some(uniqueObj =>
        Object.keys(uniqueObj).every(key => obj[key] === uniqueObj[key])
      );
      
      if (!isDuplicate) {
        uniqueObjects.push(obj);
      }
    });
  
    return uniqueObjects;
  }
  

  const filterTreatments = (treatmentsData, inputData) => {
    const result = [];
    const allConcerns = [...new Set(inputData.flatMap(item => item.concerns))];
    inputData.forEach(() => {
      const filteredTreatments = treatmentsData.map(treatment => {

        const relevantBodyParts = treatment.bodyParts.split(',').map(part => part.trim());
        const filteredBodyParts = relevantBodyParts.filter(part => inputData.some(input => input.bodyPartName === part));
        
          for(i in treatment.treatments){
            const filteredTreatmentDetails = treatmentDetails.filter(obj => obj.Name == treatment.treatments[i].name);
            treatmentsOthers=filteredTreatmentDetails[0].AdditionalTreatments.filter(obj => obj !=treatment.concern)
            console.log(treatmentsOthers)
          treatment.treatments[i] ={
            ...treatment.treatments[i],
            treatmentProcess : filteredTreatmentDetails[0].ProcessInformation,
            additionalTreatments : treatmentsOthers,
            treatmentRecommendation : filteredTreatmentDetails[0].Recommendation  
          }
          }
    

        
    
        return {
          ...treatment,
          bodyParts: filteredBodyParts.join(','),
        };
      });
  
      result.push(...filteredTreatments);
    });
  
    result1 = result.filter(obj => allConcerns.includes(obj.concern));

    return removeDuplicateObjects(result1);

  };
  
  



  app.post('/getTreatments', async (req, res) => {
    const selections = req.query.selections; // Access selections from query parameters
    const mailObj = {
      toEmail: req.body.toEmail, // Assuming you pass toEmail in the request body
      firstName: req.body.firstName, // Assuming you pass firstName in the request body
      email_string: req.body.email_string // Assuming you pass email_string in the request body
    };
  
    if (!selections) {
      return res.status(400).json({ error: 'Invalid request. Missing selections parameter.' });
    }
  
    try {
      const parsedSelections = JSON.parse(selections);
      const filteredTreatments = filterTreatments(treatments, parsedSelections);
      if (!mailObj.toEmail){
        console.log("no email recieved");
      }
      else{
      await sendEmail(mailObj); // Pass mailObj to the sendEmail function
      }
      res.json(filteredTreatments);
    } catch (error) {
      res.status(400).json({ error: 'Invalid JSON format in selections parameter.' });
    }
  });



