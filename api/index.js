require("dotenv").config();
const express = require("express");
const val = require("./validate_questionnaire.js");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse incoming json data into req.body
app.use(express.json());

app.get("/", (req, res) => {
  res.send("<h1>FHIR Value Expression Verification API</h1>");
});

app.post("/validateExpressions", (req, res) => {
  var data = req.body;

  context = {};
  context["resource"] = data;

  const variables = val.getResourceVariable(data);
  for (varindex in variables) {
    vari = variables[varindex].valueExpression;
    context[vari.name] = variables[vari.expression];
  }

  try {
    val.validateItemExpressions(data, context);
    res.status(202).send("The expressions are VALID!");
  } catch (error) {
    res.status(409).send(error.message);
  }
});

app.listen(PORT, () => {
  console.log(`API is running on http://localhost:${PORT}`);
});
