const pdfParse = require("pdf-parse");
const natural = require("natural");

const detectStudyType = (text) => {
  const studyKeywords = {
    "Meta-analysis": [
      "systematic review",
      "meta-analysis",
      "pooled data",
      "meta-analysis of studies",
    ],
    "Case study": [
      "case study",
      "patient case",
      "clinical report",
      "individual case",
      "case series",
    ],
    "Cohort study": [
      "cohort",
      "prospective",
      "retrospective",
      "longitudinal",
      "follow-up study",
    ],
    "Control study": [
      "control",
      "randomized control",
      "intervention study",
      "control group",
      "RCT",
    ],
  };

  for (const [studyType, keywords] of Object.entries(studyKeywords)) {
    for (const keyword of keywords) {
      if (text.toLowerCase().includes(keyword)) {
        return studyType;
      }
    }
  }

  return "Study type not identified"; // Default if no match is found
};

exports.uploadPaper = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    const pdfBuffer = req.file.buffer;
    const pdfData = await pdfParse(pdfBuffer);

    // Extract text from the PDF
    const text = pdfData.text;

    // Detect study type
    const studyType = detectStudyType(text);

    // Existing logic for title, abstract, etc.
    const metadata = pdfData.info;
    const title = extractTitle(text, metadata);
    const abstract = extractAbstract(text);

    const sections = [
      "Introduction",
      "Materials and Methods",
      "Statistical Analysis",
      "Results",
      "Discussion",
      "Conclusion",
    ];

    const extractedSections = {};
    sections.forEach((section) => {
      const sectionText = extractSection(section);
      if (sectionText) {
        const paragraphs = sectionText
          .split("\n")
          .map((p) => p.trim())
          .filter((p) => p.length > 0);
        const summarizedParagraphs = paragraphs.map(summarizeParagraph);
        extractedSections[section] = summarizedParagraphs.join("\n\n");
      }
    });

    const tokenizer = new natural.WordTokenizer();
    const tokens = tokenizer.tokenize(text);
    const keywords = tokens.filter((word) => word.length > 4).slice(0, 20);

    const summarizedText = text.split(". ").slice(0, 3).join(". ") + ".";

    res.json({
      message: "PDF processed successfully.",
      title,
      abstract: abstract || "No abstract found.",
      studyType, // Add study type here
      extractedText: text.substring(0, 500) + "...",
      summary: summarizedText,
      keywords,
      sections: extractedSections,
      metadata: {
        title: metadata.Title,
        author: metadata.Author,
        subject: metadata.Subject,
        creator: metadata.Creator,
        producer: metadata.Producer,
        creationDate: metadata.CreationDate,
      },
    });
  } catch (error) {
    console.error("Error processing PDF:", error);
    res.status(500).json({ message: "Error processing PDF." });
  }
};

const axios = require("axios");
const cheerio = require("cheerio");

exports.uploadUrl = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ message: "URL cannot be empty." });
    }

    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const title = $("head title").text();
    let abstract = $("meta[name='description']").attr("content");

    if (!abstract) {
      const possibleAbstracts = $("article, .abstract, .intro, p")
        .filter((index, element) => $(element).text().length > 100)
        .first()
        .text();
      abstract = possibleAbstracts
        ? possibleAbstracts.trim()
        : "No abstract found.";
    }

    const keywords = $("meta[name='keywords']").attr("content")
      ? $("meta[name='keywords']").attr("content").split(",")
      : [];

    const content = $("article").text() || $("body").text();
    const summarizedText = content.split(". ").slice(0, 3).join(". ") + ".";

    // Detect study type based on content
    const studyType = detectStudyType(content);

    res.json({
      message: "URL processed successfully.",
      title,
      abstract,
      studyType, // Add study type here
      summary: summarizedText,
      keywords,
    });
  } catch (error) {
    console.error("Error processing URL:", error);
    res.status(500).json({ message: "Error processing URL." });
  }
};
