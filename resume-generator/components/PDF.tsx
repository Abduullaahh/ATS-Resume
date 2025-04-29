import React, { useState } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface Contact {
    phone: string;
    email: string;
    linkedin: string;
    github: string;
}

interface Education {
    institution: string;
    degree: string;
    location: string;
    duration: string;
}

interface Experience {
    title: string;
    organization: string;
    location: string;
    duration: string;
    description: string[];
}

interface Project {
    name: string;
    technologies: string[];
    duration: string;
    location: string;
    description: string[];
}

interface Skills {
    programming_languages: string[];
    frameworks_libraries: string[];
    developer_tools: string[];
}

interface ResumeData {
    name: string;
    summary: string;
    contact: Contact;
    education: Education[];
    experience_and_trainings: Experience[];
    projects: Project[];
    skills: Skills;
    certifications_and_awards: string[];
}

interface ResumePDFProps {
    data: ResumeData;
}

const sampleData: ResumeData = {
    name: "Alex Johnson",
    summary: "Full Stack Developer with 5 years of experience",
    contact: {
        phone: "+1 (555) 123-4567",
        email: "alex.johnson@example.com",
        linkedin: "linkedin.com/in/alexjohnson",
        github: "github.com/alexjohnson"
    },
    education: [
        {
            institution: "University of Technology",
            degree: "Bachelor of Science in Computer Science",
            location: "San Francisco, CA",
            duration: "2015-2019"
        }
    ],
    experience_and_trainings: [
        {
            title: "Senior Developer",
            organization: "Tech Solutions Inc.",
            location: "San Francisco, CA",
            duration: "2020 - Present",
            description: [
                "Led a team of 5 developers to build a scalable e-commerce platform",
                "Implemented CI/CD pipeline reducing deployment time by 40%",
                "Optimized database queries resulting in 30% performance improvement"
            ]
        },
        {
            title: "Junior Developer",
            organization: "StartUp Co.",
            location: "Oakland, CA",
            duration: "2019 - 2020",
            description: [
                "Developed responsive frontend using React and TypeScript",
                "Participated in Agile development process with bi-weekly sprints"
            ]
        }
    ],
    projects: [
        {
            name: "E-commerce Platform",
            technologies: ["React", "Node.js", "MongoDB"],
            duration: "2021",
            location: "Self-directed",
            description: [
                "Built a fully functional e-commerce platform with payment integration",
                "Implemented responsive design principles for cross-device compatibility"
            ]
        }
    ],
    skills: {
        programming_languages: ["JavaScript", "TypeScript", "Python", "Java"],
        frameworks_libraries: ["React", "Node.js", "Express", "Redux"],
        developer_tools: ["Git", "Docker", "AWS", "Jenkins"]
    },
    certifications_and_awards: [
        "AWS Certified Developer",
        "Google Cloud Professional Developer"
    ]
};

const ResumePDF: React.FC<ResumePDFProps> = ({ data = sampleData }) => {
    const [showPreview, setShowPreview] = useState(true);

    const generatePDF = () => {
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
            compress: true,
        });

        // Font styles
        doc.setFont('times', 'normal');

        // Name as header
        doc.setFontSize(18);
        doc.setFont('times', 'bold');
        doc.text(data.name, doc.internal.pageSize.width / 2, 15, { align: 'center' });

        // Contact information
        doc.setFontSize(9);
        doc.setFont('times', 'normal');
        const contactInfo = `${data.contact.phone} | ${data.contact.email} | ${data.contact.linkedin} | ${data.contact.github}`;
        doc.text(contactInfo, doc.internal.pageSize.width / 2, 22, { align: 'center' });

        // Horizontal line
        doc.setLineWidth(0.5);
        doc.line(15, 28, doc.internal.pageSize.width - 15, 28);

        // Education Section
        doc.setFontSize(12);
        doc.setFont('times', 'bold');
        doc.text('EDUCATION', 15, 35);
        doc.setLineWidth(0.3);
        doc.line(15, 37, doc.internal.pageSize.width - 15, 37);

        let yPos = 42;
        data.education.forEach(edu => {
            doc.setFontSize(11);
            doc.setFont('times', 'bold');
            doc.text(edu.institution, 15, yPos);
            doc.setFont('times', 'italic');
            doc.text(edu.degree, 15, yPos + 5);

            doc.setFont('times', 'normal');
            doc.text(edu.location, doc.internal.pageSize.width - 10, yPos, { align: 'right' });
            doc.text(edu.duration, doc.internal.pageSize.width - 10, yPos + 5, { align: 'right' });

            yPos += 15;
        });

        // Experience Section
        doc.setFontSize(12);
        doc.setFont('times', 'bold');
        doc.text('EXPERIENCE', 15, yPos);
        doc.setLineWidth(0.3);
        doc.line(15, yPos + 2, doc.internal.pageSize.width - 15, yPos + 2);
        yPos += 7;

        data.experience_and_trainings.forEach(exp => {
            doc.setFontSize(11);
            doc.setFont('times', 'bold');
            doc.text(exp.title, 15, yPos);
            doc.setFont('times', 'italic');
            doc.text(exp.organization, 15, yPos + 5);

            if (exp.location) {
                doc.setFont('times', 'normal');
                doc.text(exp.location, doc.internal.pageSize.width - 10, yPos, { align: 'right' });
            }

            if (exp.duration) {
                doc.text(exp.duration, doc.internal.pageSize.width - 10, yPos + 5, { align: 'right' });
            }

            yPos += 10;

            // Bullet points for experience description
            doc.setFontSize(10);
            exp.description.forEach(desc => {
                doc.setFont('times', 'normal');
                doc.text('• ' + desc, 18, yPos);

                const textLines = doc.splitTextToSize(desc, 170);
                yPos += 5 * textLines.length;
            });

            yPos += 5;
        });

        // Projects Section
        doc.setFontSize(12);
        doc.setFont('times', 'bold');
        doc.text('PROJECTS', 15, yPos);
        doc.setLineWidth(0.3);
        doc.line(15, yPos + 2, doc.internal.pageSize.width - 15, yPos + 2);
        yPos += 7;

        data.projects.forEach((project) => {
            // Check need of new page
            if (yPos > 270) {
                doc.addPage();
                yPos = 15;
            }

            doc.setFontSize(11);
            doc.setFont('times', 'bold');
            doc.text(project.name, 15, yPos);

            // Technologies in italics
            doc.setFont('times', 'italic');
            const techText = `| ${project.technologies.join(', ')}`;
            doc.text(techText, 15 + doc.getTextWidth(project.name + ' '), yPos);

            // Duration and location if available
            if (project.duration || project.location) {
                let rightText = '';
                if (project.duration && project.location) {
                    rightText = `${project.duration} - ${project.location}`;
                } else if (project.duration) {
                    rightText = project.duration;
                } else if (project.location) {
                    rightText = project.location;
                }

                if (rightText) {
                    doc.setFont('times', 'normal');
                    doc.text(rightText, doc.internal.pageSize.width - 10, yPos, { align: 'right' });
                }
            }

            yPos += 5;

            // Bullet points for project description
            doc.setFontSize(10);
            project.description.forEach(desc => {
                // Check need of new page
                if (yPos > 270) {
                    doc.addPage();
                    yPos = 15;
                }

                doc.setFont('times', 'normal');
                doc.text('• ' + desc, 18, yPos);

                // Calculate lines this description will take
                const textLines = doc.splitTextToSize(desc, 170);
                yPos += 5 * textLines.length;
            });

            yPos += 5;
        });

        // Technical Skills Section
        // Check need of new page
        if (yPos > 240) {
            doc.addPage();
            yPos = 15;
        }

        doc.setFontSize(12);
        doc.setFont('times', 'bold');
        doc.text('TECHNICAL SKILLS', 15, yPos);
        doc.setLineWidth(0.3);
        doc.line(15, yPos + 2, doc.internal.pageSize.width - 15, yPos + 2);
        yPos += 7;

        // Programming Languages
        doc.setFontSize(10);
        doc.setFont('times', 'bold');
        doc.text('Stack:', 15, yPos);
        doc.setFont('times', 'normal');
        const langText = data.skills.programming_languages.join(', ');
        doc.text(langText, 15 + doc.getTextWidth('Stack: '), yPos);
        yPos += 5;

        // Frameworks
        doc.setFont('times', 'bold');
        doc.text('Frameworks:', 15, yPos);
        doc.setFont('times', 'normal');
        const frameText = data.skills.frameworks_libraries.join(', ');
        doc.text(frameText, 15 + doc.getTextWidth('Frameworks: '), yPos);
        yPos += 5;

        // Developer Tools
        doc.setFont('times', 'bold');
        doc.text('Developer Tools:', 15, yPos);
        doc.setFont('times', 'normal');
        const toolsText = data.skills.developer_tools.join(', ');
        doc.text(toolsText, 15 + doc.getTextWidth('Developer Tools: '), yPos);

        // Save the PDF
        doc.save(`${data.name.replace(/\s+/g, '_')}_Resume.pdf`);
    };

    return (
        <div className="flex flex-col items-center w-full">
            <h1 className="text-2xl font-bold mb-4">Resume Preview</h1>

            <div className="flex space-x-4 mb-6">
                <button
                    onClick={() => setShowPreview(true)}
                    className={`py-2 px-4 rounded font-bold ${showPreview ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                >
                    Show Preview
                </button>
                <button
                    onClick={generatePDF}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                >
                    Download PDF
                </button>
            </div>

            {showPreview && (
                <div className="border border-gray-300 shadow-lg rounded-md w-full text-gray-800 bg-white p-8 mb-8">
                    <div className="preview-page" style={{ maxWidth: '100%', minHeight: '842px', position: 'relative' }}>
                        {/* Header Section */}
                        <div className="text-center mb-4">
                            <h1 className="text-xl font-bold">{data.name}</h1>
                            <p className="text-sm">{data.contact.phone} | {data.contact.email} | {data.contact.linkedin} | {data.contact.github}</p>
                        </div>

                        <hr className="my-3 border-t border-gray-400" />

                        {/* Education Section */}
                        <div className="mb-4">
                            <h2 className="text-base font-bold uppercase">EDUCATION</h2>
                            <hr className="my-1 border-t border-gray-300" />

                            {data.education.map((edu, index) => (
                                <div key={index} className="mb-3">
                                    <div className="flex justify-between">
                                        <h3 className="font-bold">{edu.institution}</h3>
                                        <span>{edu.location}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <p className="italic">{edu.degree}</p>
                                        <span>{edu.duration}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Experience Section */}
                        <div className="mb-4">
                            <h2 className="text-base font-bold uppercase">EXPERIENCE</h2>
                            <hr className="my-1 border-t border-gray-300" />

                            {data.experience_and_trainings.map((exp, index) => (
                                <div key={index} className="mb-4">
                                    <div className="flex justify-between">
                                        <h3 className="font-bold">{exp.title}</h3>
                                        <span>{exp.location}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <p className="italic">{exp.organization}</p>
                                        <span>{exp.duration}</span>
                                    </div>
                                    <ul className="list-disc ml-6 mt-1">
                                        {exp.description.map((desc, i) => (
                                            <li key={i} className="text-sm">{desc}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        {/* Projects Section */}
                        <div className="mb-4">
                            <h2 className="text-base font-bold uppercase">PROJECTS</h2>
                            <hr className="my-1 border-t border-gray-300" />

                            {data.projects.map((project, index) => (
                                <div key={index} className="mb-4">
                                    <div className="flex justify-between">
                                        <h3>
                                            <span className="font-bold">{project.name}</span>
                                            <span className="italic"> | {project.technologies.join(', ')}</span>
                                        </h3>
                                        <span>{project.duration} - {project.location}</span>
                                    </div>
                                    <ul className="list-disc ml-6 mt-1">
                                        {project.description.map((desc, i) => (
                                            <li key={i} className="text-sm">{desc}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        {/* Skills Section */}
                        <div>
                            <h2 className="text-base font-bold uppercase">TECHNICAL SKILLS</h2>
                            <hr className="my-1 border-t border-gray-300" />

                            <div className="text-sm">
                                <p><span className="font-bold">Stack:</span> {data.skills.programming_languages.join(', ')}</p>
                                <p><span className="font-bold">Frameworks:</span> {data.skills.frameworks_libraries.join(', ')}</p>
                                <p><span className="font-bold">Developer Tools:</span> {data.skills.developer_tools.join(', ')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResumePDF;