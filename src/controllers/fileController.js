const createPresignedUrl = async (req, res, next) => {
  // 1. Only allow images or video
  // 2.

  res.status(201).json({ status: 'success' });
};

const getAllFiles = async (req, res, next) => {
  res.status(200).json({ status: 'success' });
};

const deleteFile = async (req, res, next) => {
  res.status(200).json({ status: 'success' });
};

const deleteManyFiles = async (req, res, next) => {
  res.status(200).json({ status: 'success' });
};

const filesController = {
  createPresignedUrl,
  deleteFile,
  deleteManyFiles,
  getAllFiles,
};

module.exports = filesController;
