const jobCategory = require('../models/CategoryModel');

const categoryController = {
    async postCategory(req, res) {
        try {
            const { categoryName, icon } = req.body;
            
            if(!categoryName || !icon) {
                res.status(200).json({message: "Both fields are required"})
            }

            const ctg = await jobCategory.findOne({ categoryName });
            if (ctg)  return res.status(200).json({ message: "Category already added", status: 401 });


            // Create a new category
            const category = new jobCategory({
                categoryName,
                icon,
            });
            await category.save();

            res.status(200).json({ message: "Category added successfully", status: 201 });
        } catch (err) {
            console.error("Error in adding category:", err);
            res.status(500).json({ message: "Internal server error" });
        }
    },
    async updateCategory(req, res) {
        try {
            const { id } = req.params;
            const { categoryName, icon } = req.body;

            // Find the job by ID and update it
            const category = await jobCategory.findById(id);
            if (!category) {
                return res.status(404).json({ message: "Category not found" });
            }

            category.categoryName = categoryName;
            category.icon = icon;

            await category.save();

            res.status(200).json({ message: "Category updated successfully", status: 200 });
        } catch (err) {
            console.error("Error in updating Category:", err);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    // async getJobById(req, res) {
    //     try {
    //         const { jobId } = req.params;
    //         const job = await Job.findById(jobId);
    //         if (!job) {
    //             return res.status(200).json({ message: "Job not found", status: 404 });
    //         }
    //         res.status(200).json(job);
    //     } catch (err) {
    //         console.error("Error in getting job by ID:", err);
    //         res.status(500).json({ message: "Internal server error" });
    //     }
    // },


    async categories(req, res) {
        try {
            const { categoryName, page = 1, limit = 10 } = req.query;
    
            // Ensure page and limit are valid numbers
            const currentPage = Number(page) || 1;
            const perPage = Number(limit) || 10;
    
            const filter = {};
    
            if (categoryName) filter.categoryName = new RegExp(categoryName, 'i'); 
    
            const sortBy = { createdAt: -1 }; 
    
            const categories = await jobCategory.find(filter)
                  .sort(sortBy) 
                  .skip((currentPage - 1) * perPage)
                  .limit(perPage);
    
            const totalCategories = await jobCategory.countDocuments(filter);
            const totalPages = Math.ceil(totalCategories / perPage);
    
            res.status(200).json({
                categories,
                pagination: {
                    totalCategories,
                    totalPages,
                    currentPage,
                    perPage
                }
            });
        } catch (err) {
            console.error("Error in getting all categories:", err); 
            res.status(500).json({ message: "Internal server error" });
        }
    },
    

    async deleteCategory(req, res) {
        try {
            const { id } = req.params;
            const category = await jobCategory.findByIdAndDelete(id);
            if (!category) {
                return res.status(404).json({ message: "Category not found" });
            }

            res.status(200).json({ message: "Category deleted successfully" });
        } catch (err) {
            console.error("Error in deleting category:", err);
            res.status(500).json({ message: "Internal server error" });
        }
    }
};

module.exports = categoryController;
