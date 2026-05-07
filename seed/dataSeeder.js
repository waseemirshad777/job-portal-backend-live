require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { faker } = require('@faker-js/faker');
const connectToMongo = require('../db/db');

// Import models
const User = require('../models/User');
const Job = require('../models/Job');
const Companies = require('../models/Companies');
const Blog = require('../models/Blog');
const JobCategory = require('../models/CategoryModel');
const Resume = require('../models/Resume');

// Cloudinary placeholder images
const getRandomImage = () => {
    const images = [
        'https://res.cloudinary.com/demo/image/fetch/https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/2018_F1_Season.jpg/1280px-2018_F1_Season.jpg',
        'https://res.cloudinary.com/demo/image/fetch/https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Growing_tomatoes_in_a_polytunnel_-_geograph.org.uk_-_590558.jpg/1024px-Growing_tomatoes_in_a_polytunnel_-_geograph.org.uk_-_590558.jpg',
        'https://res.cloudinary.com/demo/image/fetch/https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/John_House%2C_ Bleecker_Street%2C_NYC.jpg/1024px-John_House%2C_Bleecker_Street%2C_NYC.jpg',
        'https://via.placeholder.com/400x300?text=Job+Image',
        'https://via.placeholder.com/600x400?text=Blog+Post',
    ];
    return images[Math.floor(Math.random() * images.length)];
};

connectToMongo();

const seedDatabase = async () => {
    try {
        console.log('Starting database seeding...\n');

        // Clear existing data (optional - comment out if you want to preserve existing data)
        // await User.deleteMany({});
        // await Job.deleteMany({});
        // await Companies.deleteMany({});
        // await Blog.deleteMany({});
        // await JobCategory.deleteMany({});
        // await Resume.deleteMany({});

        // ============ SEED CATEGORIES ============
        console.log('Creating job categories...');
        const categories = [
            { categoryName: 'Information Technology (IT)', icon: 'fa-solid fa-laptop-code' },
            { categoryName: 'Healthcare & Medical', icon: 'fa-solid fa-user-doctor' },
            { categoryName: 'Education & Training', icon: 'fa-solid fa-graduation-cap' },
            { categoryName: 'Finance & Accounting', icon: 'fa-solid fa-coins' },
            { categoryName: 'Marketing & Sales', icon: 'fa-solid fa-bullhorn' },
            { categoryName: 'Engineering', icon: 'fa-solid fa-gears' },
            { categoryName: 'Customer Support', icon: 'fa-solid fa-headset' },
            { categoryName: 'Construction & Labor', icon: 'fa-solid fa-helmet-safety' },
            { categoryName: 'Human Resources (HR)', icon: 'fa-solid fa-users' },
            { categoryName: 'Design & Creative', icon: 'fa-solid fa-pen-nib' }
        ];

        const createdCategories = await JobCategory.insertMany(categories);
        console.log(`✓ Created ${createdCategories.length} categories\n`);

        // ============ SEED EMPLOYEES ============
        console.log('Creating 20 employee users...');
        const employeePassword = await bcrypt.hash('employee123', 10);
        const employees = [];

        for (let i = 0; i < 20; i++) {
            const employee = new User({
                username: faker.internet.username().toLowerCase(),
                email: `employee${i + 1}@jobportal.com`,
                fname: faker.person.firstName(),
                lname: faker.person.lastName(),
                password: employeePassword,
                confirmPassword: employeePassword,
                role: 'employee',
                profilePhoto: getRandomImage(),
                isEmailVerified: true,
            });
            employees.push(await employee.save());
        }
        console.log(`✓ Created ${employees.length} employees\n`);

        // ============ SEED RESUMES ============
        console.log('Creating 20 resumes...');
        const resumes = [];
        for (let i = 0; i < employees.length; i++) {
            const employee = employees[i];
            const resume = new Resume({
                employeeId: employee._id.toString(),
                fullName: `${employee.fname} ${employee.lname}`,
                designation: faker.person.jobTitle(),
                resumeBanner: getRandomImage(),
                profilePicture: employee.profilePhoto,
                experience: faker.helpers.arrayElement(['0-1 years', '1-3 years', '3-5 years', '5+ years']),
                expectedSalary: `${faker.number.int({ min: 50000, max: 150000 })} USD`,
                educationLevel: faker.helpers.arrayElement(['Bachelors', 'Masters', 'PhD', 'High School']),
                language: faker.helpers.arrayElement(['English', 'Spanish', 'French', 'German']),
                shortDetails: faker.lorem.sentence(),
                aboutYourself: faker.lorem.paragraphs(2),
                skills: faker.helpers.arrayElements(['JavaScript', 'React', 'Node.js', 'Python', 'AWS', 'Communication', 'Management', 'Design', 'Accounting'], { min: 3, max: 5 }).join(','),
                workingExperience: faker.lorem.paragraph(),
                resume: 'https://via.placeholder.com/150?text=Resume+PDF', // placeholder link
                address: {
                    country: faker.location.country(),
                    state: faker.location.state(),
                    fullAddress: faker.location.streetAddress()
                },
                contactInfo: {
                    phone: faker.phone.number(),
                    email: employee.email
                }
            });
            resumes.push(await resume.save());
        }
        console.log(`✓ Created ${resumes.length} resumes\n`);

        // ============ SEED EMPLOYERS ============
        console.log('Creating 20 employer users with companies...');
        const employers = [];
        const companies = [];

        for (let i = 0; i < 20; i++) {
            const employer = new User({
                username: faker.internet.username().toLowerCase(),
                email: `employer${i + 1}@jobportal.com`,
                fname: faker.person.firstName(),
                lname: faker.person.lastName(),
                password: employeePassword,
                confirmPassword: employeePassword,
                role: 'employer',
                profilePhoto: getRandomImage(),
                isEmailVerified: true,
            });
            const savedEmployer = await employer.save();
            employers.push(savedEmployer);

            // Create company for each employer
            const company = new Companies({
                employerId: savedEmployer._id.toString(),
                companyName: faker.company.name(),
                companyTagline: faker.company.catchPhrase(),
                companyBanner: getRandomImage(),
                companyLogo: getRandomImage(),
                shortDetails: faker.company.buzzPhrase(),
                aboutCompany: faker.lorem.paragraphs(2),
                companyField: faker.helpers.arrayElement([
                    'Technology',
                    'Finance',
                    'Healthcare',
                    'E-commerce',
                    'Education',
                    'Manufacturing',
                ]),
                skills: faker.helpers.arrayElement([
                    'JavaScript,React,Node.js',
                    'Python,Django,PostgreSQL',
                    'Java,Spring Boot,AWS',
                    'Go,Kubernetes,Docker',
                ]),
                address: {
                    country: faker.location.country(),
                    state: faker.location.state(),
                    city: faker.location.city(),
                    fullAddress: faker.location.streetAddress(),
                },
                contactInfo: {
                    phone: faker.phone.number(),
                    email: `company${i + 1}@company.com`,
                },
            });
            companies.push(await company.save());
        }
        console.log(`✓ Created ${employers.length} employers\n`);
        console.log(`✓ Created ${companies.length} companies\n`);

        // ============ SEED JOBS ============
        console.log('Creating 30 jobs...');
        const jobs = [];
        const jobTitles = [
            'Software Engineer', 'IT Support Specialist', 'Data Analyst',
            'Registered Nurse', 'Medical Assistant', 'Pharmacy Technician',
            'High School Teacher', 'Tutor', 'Instructional Designer',
            'Financial Analyst', 'Accountant', 'Tax Specialist',
            'Marketing Manager', 'SEO Specialist', 'Content Strategist',
            'Civil Engineer', 'Mechanical Engineer', 'Electrical Engineer',
            'Customer Service Representative', 'Technical Support Agent',
            'Construction Worker', 'Project Manager', 'Electrician',
            'HR Generalist', 'Recruiter', 'Benefits Coordinator',
            'Graphic Designer', 'UX/UI Designer', 'Art Director'
        ];

        for (let i = 0; i < 30; i++) {
            const randomEmployer = employers[Math.floor(Math.random() * employers.length)];
            const randomCompany = companies[Math.floor(Math.random() * companies.length)];
            const randomCategory = createdCategories[Math.floor(Math.random() * createdCategories.length)];

            const job = new Job({
                title: jobTitles[Math.floor(Math.random() * jobTitles.length)],
                employerId: randomEmployer._id.toString(),
                applyEmail: randomEmployer.email,
                jobType: faker.helpers.arrayElement(['Full-time', 'Part-time', 'Contract', 'Freelance']),
                jobCategory: randomCategory._id,
                jobTags: faker.helpers.arrayElements(
                    ['React', 'Node.js', 'Python', 'AWS', 'Docker', 'Kubernetes', 'MongoDB', 'PostgreSQL'],
                    { min: 2, max: 4 }
                ).join(','),
                jobSkills: faker.helpers.arrayElements(
                    ['Communication', 'Problem Solving', 'Team Work', 'Leadership', 'Attention to Detail', 'Time Management'],
                    { min: 2, max: 4 }
                ).join(','),
                company: randomCompany._id,
                location: faker.location.city(),
                salaryFrom: faker.number.int({ min: 40000, max: 80000 }),
                salaryTo: faker.number.int({ min: 100000, max: 200000 }),
                salaryCurrency: 'USD',
                experience: faker.helpers.arrayElement(['0-1 years', '1-3 years', '3-5 years', '5+ years']),
                description: faker.lorem.paragraphs(2),
                requirements: faker.lorem.paragraphs(2),
                jobImage: getRandomImage(),
                saved: false,
            });
            jobs.push(await job.save());
        }
        console.log(`✓ Created ${jobs.length} jobs\n`);

        // ============ SEED BLOGS ============
        console.log('Creating 15 blogs...');
        const blogs = [];
        const blogTopics = [
            'Getting Started with React',
            'Node.js Best Practices',
            'Understanding MongoDB',
            'AWS Lambda Functions',
            'Docker Containerization Guide',
            'Kubernetes Deployment',
            'TypeScript Tips and Tricks',
            'REST API Design',
            'GraphQL vs REST',
            'Microservices Architecture',
            'CI/CD Pipeline Setup',
            'Security Best Practices',
            'Performance Optimization',
            'Testing Strategies',
            'Code Review Guidelines',
        ];

        for (let i = 0; i < 15; i++) {
            const randomEmployee = employees[Math.floor(Math.random() * employees.length)];

            const blog = new Blog({
                user: randomEmployee._id,
                title: blogTopics[i],
                blogKeywords: faker.lorem.words(5).split(' ').join(','),
                blogContent: faker.lorem.paragraphs(4),
                blogImage: getRandomImage(),
            });
            blogs.push(await blog.save());
        }
        console.log(`✓ Created ${blogs.length} blogs\n`);

        // ============ SUMMARY ============
        console.log('\n='.repeat(50));
        console.log('DATABASE SEEDING COMPLETED SUCCESSFULLY!');
        console.log('='.repeat(50));
        console.log(`
Total Data Created:
  • Employees: ${employees.length}
  • Resumes: ${resumes.length}
  • Employers: ${employers.length}
  • Companies: ${companies.length}
  • Job Categories: ${createdCategories.length}
  • Jobs: ${jobs.length}
  • Blogs: ${blogs.length}

Test Credentials:
  Email: employee1@jobportal.com (or any employee)
  Password: employee123
  
  Email: employer1@jobportal.com (or any employer)
  Password: employee123

Note: All users have isEmailVerified = true, so you can login directly.
        `);
        console.log('='.repeat(50) + '\n');

    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        mongoose.connection.close();
    }
};

seedDatabase();
