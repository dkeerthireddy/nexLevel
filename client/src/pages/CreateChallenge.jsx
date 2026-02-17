import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { Plus, X, Target } from 'lucide-react';
import { CREATE_CHALLENGE } from '../lib/graphql';

const CreateChallenge = () => {
  const navigate = useNavigate();
  const [createChallenge, { loading, error }] = useMutation(CREATE_CHALLENGE, {
    onCompleted: () => {
      navigate('/challenges');
    }
  });

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'fitness',
    frequency: 'daily',
    duration: 30,
    requirePhotoProof: false,
    allowGraceSkips: true,
    graceSkipsPerWeek: 1,
    isPublic: true,
  });

  const [tasks, setTasks] = useState([
    { title: '', description: '' }
  ]);

  const [customFrequency, setCustomFrequency] = useState({
    type: 'days_per_week', // 'days_per_week' or 'specific_days'
    daysPerWeek: 3,
    specificDays: [] // Array of day indices: 0 = Sunday, 1 = Monday, etc.
  });

  const [formError, setFormError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const addTask = () => {
    setTasks([...tasks, { title: '', description: '' }]);
  };

  const removeTask = (index) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const updateTask = (index, field, value) => {
    const newTasks = [...tasks];
    newTasks[index][field] = value;
    setTasks(newTasks);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validation
    if (!formData.name.trim()) {
      setFormError('Challenge name is required');
      return;
    }

    if (!formData.description.trim()) {
      setFormError('Challenge description is required');
      return;
    }

    if (formData.duration < 1) {
      setFormError('Duration must be at least 1 day');
      return;
    }

    // Filter out empty tasks
    const validTasks = tasks
      .filter(task => task.title.trim())
      .map((task, index) => ({
        title: task.title.trim(),
        description: task.description.trim() || null,
        order: index
      }));

    try {
      await createChallenge({
        variables: {
          input: {
            ...formData,
            duration: parseInt(formData.duration),
            graceSkipsPerWeek: parseInt(formData.graceSkipsPerWeek),
            tasks: validTasks
          }
        }
      });
    } catch (err) {
      console.error('Create challenge error:', err);
      setFormError(err.message || 'Failed to create challenge');
    }
  };

  const categories = [
    { value: 'fitness', label: 'Fitness' },
    { value: 'health', label: 'Health' },
    { value: 'productivity', label: 'Productivity' },
    { value: 'mindfulness', label: 'Mindfulness' },
    { value: 'learning', label: 'Learning' },
    { value: 'social', label: 'Social' },
    { value: 'creative', label: 'Creative' },
    { value: 'other', label: 'Other' },
  ];

  const frequencies = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: '3x_week', label: '3x per Week' },
    { value: 'custom', label: 'Custom' },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Challenge</h1>
        <p className="text-gray-600">Design your own challenge with custom tasks and build streaks together</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Challenge Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Challenge Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., 75 Hard Challenge"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe what this challenge is about..."
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            required
          />
        </div>

        {/* Category and Frequency Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Frequency
            </label>
            <select
              name="frequency"
              value={formData.frequency}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              {frequencies.map(freq => (
                <option key={freq.value} value={freq.value}>{freq.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Custom Frequency Options */}
        {formData.frequency === 'custom' && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 space-y-4">
            <h3 className="font-medium text-gray-900">Custom Frequency Settings</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frequency Type
              </label>
              <select
                value={customFrequency.type}
                onChange={(e) => setCustomFrequency({ ...customFrequency, type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="days_per_week">Number of days per week</option>
                <option value="specific_days">Specific days of the week</option>
              </select>
            </div>

            {customFrequency.type === 'days_per_week' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Days per week: {customFrequency.daysPerWeek}
                </label>
                <input
                  type="range"
                  min="1"
                  max="7"
                  value={customFrequency.daysPerWeek}
                  onChange={(e) => setCustomFrequency({ ...customFrequency, daysPerWeek: parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1 day</span>
                  <span>7 days</span>
                </div>
              </div>
            )}

            {customFrequency.type === 'specific_days' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select specific days
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        const newDays = customFrequency.specificDays.includes(index)
                          ? customFrequency.specificDays.filter(d => d !== index)
                          : [...customFrequency.specificDays, index];
                        setCustomFrequency({ ...customFrequency, specificDays: newDays });
                      }}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        customFrequency.specificDays.includes(index)
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
                {customFrequency.specificDays.length > 0 && (
                  <p className="text-sm text-gray-600 mt-2">
                    Selected: {customFrequency.specificDays.length} day{customFrequency.specificDays.length !== 1 ? 's' : ''} per week
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Duration (days)
          </label>
          <input
            type="number"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            min="1"
            max="365"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        </div>

        {/* Tasks Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Daily Tasks
            </label>
            <button
              type="button"
              onClick={addTask}
              className="flex items-center space-x-2 px-3 py-1 text-sm bg-indigo-50 text-cyan-600 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Task</span>
            </button>
          </div>

          <div className="space-y-3">
            {tasks.map((task, index) => (
              <div key={index} className="flex gap-3 items-start">
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={task.title}
                    onChange={(e) => updateTask(index, 'title', e.target.value)}
                    placeholder={`Task ${index + 1} title`}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    value={task.description}
                    onChange={(e) => updateTask(index, 'description', e.target.value)}
                    placeholder="Task description (optional)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                  />
                </div>
                {tasks.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTask(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3 border-t pt-4">
          {/* Photo proof requirement temporarily disabled */}
          {/* <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="requirePhotoProof"
              checked={formData.requirePhotoProof}
              onChange={handleChange}
              className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
            />
            <span className="text-sm text-gray-700">Require photo proof for check-ins</span>
          </label> */}

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="allowGraceSkips"
              checked={formData.allowGraceSkips}
              onChange={handleChange}
              className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
            />
            <span className="text-sm text-gray-700">Allow grace skips</span>
          </label>

          {formData.allowGraceSkips && (
            <div className="ml-7">
              <label className="block text-sm text-gray-600 mb-1">Grace skips per week</label>
              <input
                type="number"
                name="graceSkipsPerWeek"
                value={formData.graceSkipsPerWeek}
                onChange={handleChange}
                min="0"
                max="7"
                className="w-32 px-3 py-1 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          )}

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="isPublic"
              checked={formData.isPublic}
              onChange={handleChange}
              className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
            />
            <span className="text-sm text-gray-700">Make this challenge public</span>
          </label>
        </div>

        {/* Error Display */}
        {(formError || error) && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{formError || error.message}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Target className="w-5 h-5" />
            <span>{loading ? 'Creating...' : 'Create Challenge'}</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/challenges')}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateChallenge;
