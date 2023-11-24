const readline = require('readline');

class Question {
  constructor(question, subject, topic, difficulty, marks) {
    this.question = question;
    this.subject = subject;
    this.topic = topic;
    this.difficulty = difficulty;
    this.marks = marks;
  }
}

class QuestionStore {
  constructor() {
    this.questions = [];
  }

  addQuestion(question) {
    this.questions.push(question);
  }

  getQuestionsByDifficulty(difficulty) {
    return this.questions.filter((q) => q.difficulty === difficulty);
  }
}

class QuestionPaperGenerator {
  constructor(questionStore) {
    this.questionStore = questionStore;
  }

  generateQuestionPaper(totalMarks, difficultyDistribution) {
    const questionPaper = [];
    const totalQuestions = Object.values(difficultyDistribution)
      .reduce((acc, curr) => acc + curr, 0) * totalMarks;

    const questionsByDifficulty = {};

    for (const difficulty of Object.keys(difficultyDistribution)) {
      questionsByDifficulty[difficulty] = this.questionStore.getQuestionsByDifficulty(difficulty);
    }

    for (const difficulty in difficultyDistribution) {
      const requiredCount = Math.round(difficultyDistribution[difficulty] * totalMarks);

      if (questionsByDifficulty[difficulty].length < requiredCount) {
        throw new Error(`Insufficient questions for difficulty ${difficulty}`);
      }

      for (let i = 0; i < requiredCount; i++) {
        const randomIndex = Math.floor(Math.random() * questionsByDifficulty[difficulty].length);
        questionPaper.push(questionsByDifficulty[difficulty].splice(randomIndex, 1)[0]);
      }
    }

    if (questionPaper.length !== totalQuestions) {
      throw new Error('Failed to generate the question paper with required constraints');
    }

    return questionPaper;
  }
}

function addQuestionsManually(questionStore) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  function askQuestion(query) {
    return new Promise((resolve) => {
      rl.question(query, (answer) => {
        resolve(answer);
      });
    });
  }

  async function gatherInput() {
    console.log("Add questions manually (type 'exit' to finish):");

    while (true) {
      const questionText = await askQuestion("Enter the question text: ");
      if (questionText.toLowerCase() === 'exit') break;

      const subject = await askQuestion("Enter subject: ");
      const topic = await askQuestion("Enter topic: ");
      const difficulty = await askQuestion("Enter difficulty (Easy/Medium/Hard): ");
      const marks = parseInt(await askQuestion("Enter marks: "), 10);

      questionStore.addQuestion(new Question(questionText, subject, topic, difficulty, marks));
      console.log("Question added successfully!\n");
    }

    rl.close();
  }

  gatherInput();
}

async function startQuestionPaperGenerator() {
  const questionStore = new QuestionStore();
  addQuestionsManually(questionStore);

  const totalMarks = parseInt(await askQuestion("Enter total marks for the paper: "), 10);

  const difficultyDistribution = {
    Easy: parseFloat(await askQuestion("Enter percentage of Easy questions (in decimal): ")),
    Medium: parseFloat(await askQuestion("Enter percentage of Medium questions (in decimal): ")),
    Hard: parseFloat(await askQuestion("Enter percentage of Hard questions (in decimal): ")),
  };

  const questionPaperGenerator = new QuestionPaperGenerator(questionStore);

  try {
    const generatedPaper = questionPaperGenerator.generateQuestionPaper(totalMarks, difficultyDistribution);
    console.log("Generated Question Paper:");
    console.log(generatedPaper);
  } catch (error) {
    console.error("Error generating question paper:", error.message);
  }git push --help
}

function askQuestion(query) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

startQuestionPaperGenerator();
