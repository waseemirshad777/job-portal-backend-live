const Blog = require('../models/Blog');
const uploadHelper = require('../utils/uploadHelper');

const blogController = {
    async postBlog(req, res) {
        try {
            const { user, title, blogKeywords, blogContent } = req.body;
            const blogImage = req.file ? req.file.path : null;

            const missingFields = {};
            if (!title) missingFields.title = "Blog title is required.";
            if (!user) missingFields.user = "User is required.";
            if (!blogKeywords) missingFields.blogKeywords = "Blog Keywords are required.";
            if (!blogContent) missingFields.blogContent = "Blog Content is required.";
            if (!blogImage) missingFields.blogImage = "Blog Image is required.";

            if (Object.keys(missingFields).length > 0) {
                return res.status(200).json({ message: missingFields, status: 422});
            }

            // Create a new Blog
            const blog = new Blog({
                title,
                user,
                blogKeywords,
                blogContent,
                blogImage,
            });
            await blog.save();

            res.status(200).json({ message: "Blog posted successfully", blog, status: 201 });
        } catch (err) {
            console.error("Error in posting blog:", err);
            res.status(500).json({ message: "Internal server error" });
        }
    },
    async updateBlog(req, res) {
        try {
            const { id } = req.params;
            const { user, title, blogKeywords, blogContent } = req.body;
            const blogImage = req.file ? req.file.path : null;

            const missingFields = {};
            if (!title) missingFields.title = "Blog title is required.";
            if (!user) missingFields.user = "User is required.";
            if (!blogKeywords) missingFields.blogKeywords = "Blog Keywords are required.";
            if (!blogContent) missingFields.blogContent = "Blog Content is required.";

            if (Object.keys(missingFields).length > 0) {
                return res.status(200).json({ message: missingFields, status: 422 });
            }

            const blog = await Blog.findById(id);
            if (!blog) {
                return res.status(404).json({ message: "Blog not found" });
            }
            
            
            blog.title = title || blog.title;
            blog.user = user || blog.user;
            blog.blogKeywords = blogKeywords || blog.blogKeywords;
            blog.blogContent = blogContent || blog.blogContent;
            
            // Handle image replacement - automatically deletes old image from Cloudinary
            if (blogImage) {
                await uploadHelper.handleImageReplacement(blog.blogImage, blogImage);
                blog.blogImage = blogImage;
            }
            
            await blog.save();

            res.status(200).json({ message: "Blog updated successfully", blog, status: 201 });
        } catch (err) {
            console.error("Error in updating blog:", err);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    async getBlogByUser(req, res) {
        try {
            const { userId } = req.params;

            const sortBy = { date: -1 };

            const blogs = await Blog.find({ user: userId }).populate('user').sort(sortBy);
            res.status(200).json(blogs);
        } catch (err) {
            console.error("Error in getting blogs:", err);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    async getBlogById(req, res) {
        try {
            const { blogId } = req.params;
            const blog = await Blog.findById(blogId).populate('user');
            if (!blog) {
                return res.status(200).json({ message: "Blog not found", status: 404 });
            }
            res.status(200).json(blog);
        } catch (err) {
            console.error("Error in getting blog by ID:", err);
            res.status(500).json({ message: "Internal server error" });
        }
    },


async getAllBlogs(req, res) {
    try {
        const { title , page = 1, limit = 10 } = req.query;

        const filter = {};
        if (title) filter.title = new RegExp(title, 'i');

        const sortBy = { createdAt: -1 }; 

        const blogs = await Blog.find(filter).populate('user')
              .sort(sortBy)
              .skip((page - 1) * limit)
              .limit(Number(limit));

        const totalBlogs = await Blog.countDocuments();
        const totalPages = Math.ceil(totalBlogs / limit);

        res.status(200).json({
            blogs,
            pagination: {
                totalBlogs,
                totalPages,
                currentPage: Number(page),
                perPage: Number(limit)
            }
        });
    } catch (err) {
        console.error("Error in getting all blogs:", err); 
        res.status(500).json({ message: "Internal server error" });
    }
},



    async deleteBlog(req, res) {
        try {
            const { blogId } = req.params;
            const blog = await Blog.findById(blogId);
            
            if (!blog) {
                return res.status(404).json({ message: "Blog not found" });
            }

            // Delete image from Cloudinary before deleting blog
            if (blog.blogImage) {
                await uploadHelper.handleImageDeletion(blog.blogImage);
            }

            await Blog.findByIdAndDelete(blogId);

            res.status(200).json({ message: "Blog deleted successfully" });
        } catch (err) {
            console.error("Error in deleting blog:", err);
            res.status(500).json({ message: "Internal server error" });
        }
    }
};

module.exports = blogController;
