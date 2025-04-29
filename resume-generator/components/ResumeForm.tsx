"use client"

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { resumeData } from './input';
import ResumePDF from './PDF';

interface FormData {
  name: string;
  summary: string;
  contact: {
    phone: string;
    email: string;
    linkedin: string;
    github: string;
  };
  education: Array<{
    institution: string;
    degree: string;
    location: string;
    duration: string;
  }>;
  experience_and_trainings: Array<{
    title: string;
    organization: string;
    location?: string;
    duration?: string;
    description: string[];
  }>;
  projects: Array<{
    name: string;
    technologies: string[];
    duration?: string;
    location?: string;
    description: string[];
  }>;
  skills: {
    programming_languages: string[];
    frameworks_libraries: string[];
    developer_tools: string[];
  };
  certifications_and_awards: string[];
}

export default function ResumeForm() {
  const { register, handleSubmit, formState: { errors }, setValue, getValues } = useForm<FormData>({
    defaultValues: {
      name: resumeData.name,
      summary: '',
      contact: {
        phone: resumeData.contact.phone,
        email: resumeData.contact.email,
        linkedin: resumeData.contact.linkedin,
        github: resumeData.contact.github
      },
      education: resumeData.education.map(entry => ({
        institution: entry.institution,
        degree: entry.degree,
        location: entry.location,
        duration: entry.duration
      })),
      experience_and_trainings: resumeData.experience_and_trainings.map(entry => ({
        title: entry.title,
        organization: entry.organization,
        location: entry.location || '',
        duration: entry.duration || '',
        description: [...entry.description]
      })),
      projects: resumeData.projects.map(project => ({
        name: project.name,
        technologies: [...project.technologies],
        duration: project.duration || '',
        location: project.location || '',
        description: [...project.description]
      })),
      skills: {
        programming_languages: [...resumeData.skills.programming_languages],
        frameworks_libraries: [...resumeData.skills.frameworks_libraries],
        developer_tools: [...resumeData.skills.developer_tools]
      },
      certifications_and_awards: [...resumeData.certifications_and_awards]
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [enhancedData, setEnhancedData] = useState<FormData | null>(null);
  const [step, setStep] = useState(1);
  const [jobDescription, setJobDescription] = useState('');

  const addItem = (field: keyof FormData, subfield?: string) => {
    const values = getValues();
    if (subfield && field === 'skills') {
      const skillsField = values.skills as Record<string, string[]>;
      const current = [...skillsField[subfield]];
      setValue(`${field}.${subfield}` as any, [...current, '']);
    } else {
      switch (field) {
        case 'education':
          setValue(field, [...values[field], { institution: '', degree: '', location: '', duration: '' }]);
          break;
        case 'experience_and_trainings':
          setValue(field, [...values[field], { title: '', organization: '', location: '', duration: '', description: [''] }]);
          break;
        case 'projects':
          setValue(field, [...values[field], { name: '', technologies: [''], duration: '', location: '', description: [''] }]);
          break;
        default:
          setValue(field, [...(values[field as keyof FormData] as string[]), '']);
      }
    }
  };

  const addDescriptionPoint = (field: 'experience_and_trainings' | 'projects', index: number) => {
    const values = getValues();
    const itemDescription = [...values[field][index].description, ''];
    const updatedItems = [...values[field]];
    updatedItems[index].description = itemDescription;
    if (field === 'experience_and_trainings') {
      setValue('experience_and_trainings', updatedItems as FormData['experience_and_trainings']);
    } else {
      setValue('projects', updatedItems as FormData['projects']);
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const response = await axios.post('/api/enhance-resume', {
        user_json: data,
        job_description: jobDescription
      });

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      setEnhancedData(response.data);
      setStep(2);
    } catch (error) {
      console.error('Error enhancing resume:', error);
      alert('Failed to process resume data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {step === 1 ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <h2 className="text-2xl font-bold">Personal Information</h2>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                {...register('name', { required: 'Name is required' })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Professional Summary</label>
              <textarea
                {...register('summary', { required: 'Summary is required' })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 h-32"
                placeholder="Brief overview of your professional experience and skills"
              />
              {errors.summary && <p className="text-red-500 text-sm mt-1">{errors.summary.message}</p>}
            </div>

            <h3 className="text-xl font-semibold">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="text"
                  {...register('contact.phone', { required: 'Phone is required' })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  {...register('contact.email', { required: 'Email is required' })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">LinkedIn</label>
                <input
                  type="text"
                  {...register('contact.linkedin')}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">GitHub</label>
                <input
                  type="text"
                  {...register('contact.github')}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
            </div>

            <h3 className="text-xl font-semibold mt-6">Education</h3>
            {getValues().education.map((_, index) => (
              <div key={`education-${index}`} className="p-4 border border-gray-200 rounded-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Institution</label>
                    <input
                      type="text"
                      {...register(`education.${index}.institution`, { required: 'Institution is required' })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Degree</label>
                    <input
                      type="text"
                      {...register(`education.${index}.degree`, { required: 'Degree is required' })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <input
                      type="text"
                      {...register(`education.${index}.location`)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Duration</label>
                    <input
                      type="text"
                      {...register(`education.${index}.duration`)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      placeholder="e.g., 2021-2025"
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addItem('education')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Add Education
            </button>

            <h3 className="text-xl font-semibold mt-6">Experience & Training</h3>
            {getValues().experience_and_trainings.map((_, index) => (
              <div key={`experience-${index}`} className="p-4 border border-gray-200 rounded-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                      type="text"
                      {...register(`experience_and_trainings.${index}.title`, { required: 'Title is required' })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Organization</label>
                    <input
                      type="text"
                      {...register(`experience_and_trainings.${index}.organization`, { required: 'Organization is required' })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location (Optional)</label>
                    <input
                      type="text"
                      {...register(`experience_and_trainings.${index}.location`)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Duration (Optional)</label>
                    <input
                      type="text"
                      {...register(`experience_and_trainings.${index}.duration`)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      placeholder="e.g., Jan 2022-Dec 2022"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">Description Points</label>
                  {getValues().experience_and_trainings[index].description.map((_, descIndex) => (
                    <div key={`exp-desc-${index}-${descIndex}`} className="mt-2">
                      <input
                        type="text"
                        {...register(`experience_and_trainings.${index}.description.${descIndex}`, { required: 'Description point is required' })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        placeholder="Describe your responsibilities and achievements"
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addDescriptionPoint('experience_and_trainings', index)}
                    className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                  >
                    Add Description Point
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addItem('experience_and_trainings')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Add Experience/Training
            </button>

            <h3 className="text-xl font-semibold mt-6">Projects</h3>
            {getValues().projects.map((_, index) => (
              <div key={`project-${index}`} className="p-4 border border-gray-200 rounded-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Project Name</label>
                    <input
                      type="text"
                      {...register(`projects.${index}.name`, { required: 'Project name is required' })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Technologies (comma separated)</label>
                    <input
                      type="text"
                      {...register(`projects.${index}.technologies.0`, { required: 'Technologies are required' })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      placeholder="React, Node.js, MongoDB, etc."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Duration (Optional)</label>
                    <input
                      type="text"
                      {...register(`projects.${index}.duration`)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      placeholder="e.g., Jan 2023-Mar 2023"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location (Optional)</label>
                    <input
                      type="text"
                      {...register(`projects.${index}.location`)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">Description Points</label>
                  {getValues().projects[index].description.map((_, descIndex) => (
                    <div key={`proj-desc-${index}-${descIndex}`} className="mt-2">
                      <input
                        type="text"
                        {...register(`projects.${index}.description.${descIndex}`, { required: 'Description point is required' })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        placeholder="Describe the project, your role, and achievements"
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addDescriptionPoint('projects', index)}
                    className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                  >
                    Add Description Point
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addItem('projects')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Add Project
            </button>

            <h3 className="text-xl font-semibold mt-6">Skills</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Programming Languages (comma separated)</label>
                <input
                  type="text"
                  {...register('skills.programming_languages.0')}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  placeholder="Python, JavaScript, Java, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Frameworks & Libraries (comma separated)</label>
                <input
                  type="text"
                  {...register('skills.frameworks_libraries.0')}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  placeholder="React, Node.js, Express, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Developer Tools (comma separated)</label>
                <input
                  type="text"
                  {...register('skills.developer_tools.0')}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  placeholder="Git, VS Code, Docker, etc."
                />
              </div>
            </div>

            <h3 className="text-xl font-semibold mt-6">Certifications & Awards</h3>
            {getValues().certifications_and_awards.map((_, index) => (
              <div key={`cert-${index}`} className="mt-2">
                <input
                  type="text"
                  {...register(`certifications_and_awards.${index}`)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  placeholder="Enter certification or award"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => addItem('certifications_and_awards')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Add Certification/Award
            </button>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700">Target Job Description</label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 h-32"
                placeholder="Paste the job description you're applying for"
                required
              />
            </div>

            <div className="mt-8">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400"
              >
                {isLoading ? 'Processing...' : 'Generate ATS-Friendly Resume'}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="space-x-4">
              <ResumePDF data={enhancedData} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}