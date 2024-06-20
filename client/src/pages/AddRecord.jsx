import { useEffect, useState } from 'react';
import Wrapper from '../assets/wrappers/DashboardFormPage';
import { Form } from 'react-router-dom';
import { toast } from 'react-toastify';
import RecordingIndicator from '../components/RecordingIndicator.jsx';

const AddRecord = () => {
  const [patientId, setPatientId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [hospitalId, setHospitalId] = useState('');
  const [prescription, setPrescription] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [startingTime, setStartingTime] = useState(new Date().toLocaleTimeString());
  const [endingTime, setEndingTime] = useState('');

  const serverAudioReceiverBaseUrl = 'https://d2f9-202-134-11-229.ngrok-free.app';
  const serverAudioReceiverUrl = serverAudioReceiverBaseUrl + '/upload-audio/';

  useEffect(() => {
    setPrescription('');
    console.log(new Date().toLocaleTimeString());
  }, []);


  function getTimeFormat(timeStamp) {
    const currentTimeString = timeStamp;
    const [timeWithoutSeconds, amOrPm] = currentTimeString.split(' ');
    const [hours, minutes] = timeWithoutSeconds.split(':');
    let hours24 = parseInt(hours);
    if (amOrPm.toLowerCase() === 'pm' && hours < 12) hours24 += 12;
    return hours24 + ':' + minutes;
  };

  function getDateFormat() {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    return `${year}_${month}_${day}`;
  }

  function getWavFileName() {
    return (
      patientId +
      '_' +
      hospitalId +
      '_' +
      getTimeFormat(startingTime) +
      '_' +
      getTimeFormat(new Date().toLocaleTimeString()) +
      '_' +
      getDateFormat()
    );
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = handleDataAvailable;
      recorder.start();
      setIsRecording(true);
      setMediaRecorder(recorder);
      toast.success('Recording started...', { autoClose: 1000 });
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Failed to access microphone.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      setEndingTime(new Date().toLocaleTimeString());
      mediaRecorder.stop();
      setIsRecording(false);
      toast.success('Recording stopped...', { autoClose: 1000 });
      sendAudioToServer(getWavFileName()).then((r) => {});
      downloadRecording();
    }
  };

  const sendAudioToServer = async (wavFileName) => {
    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
    const formData = new FormData();
    formData.append('audioFile', audioBlob, `${patientId}.wav`);
    try {
      const response = await fetch(serverAudioReceiverUrl + wavFileName, {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      toast.success('Successfully sent to server', { autoClose: 5000 });
    } catch (error) {
      console.error('Failed to send audio:', error);
    }
  };

  const handleDataAvailable = (event) => {
    setAudioChunks((prevChunks) => [...prevChunks, event.data]);
  };

  const downloadRecording = () => {
    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
    const audioUrl = URL.createObjectURL(audioBlob);
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `${getWavFileName()}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(audioUrl);
    setAudioChunks([]);
    toast.success(getWavFileName() + ' successfully downloaded', {
      autoClose: 3000,
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    stopRecording(); // Stop recording and submit the form
  };

  const generatePatientDetails = () => {
    const dummyPatientId = Math.floor(100000 + Math.random() * 900000);
    const dummyName = 'Sakib';
    const dummyAge = Math.floor(18 + Math.random() * 83);
    setPatientId(dummyPatientId);
    setPatientName(dummyName);
    setPatientAge(dummyAge);
    setHospitalId('Karail');
    setStartingTime(new Date().toLocaleTimeString());
    startRecording(); // Start recording when generating patient details
  };

  const handlePrescriptionChange = (event) => {
    setPrescription(event.target.value);
  };
  return (
    <Wrapper
      className="wrapper"
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      <Form method="post" className="form" onSubmit={handleSubmit}>
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <h4>Audio Recorder</h4>
        <br />
        <button
          type="button"
          className="btn btn-block btn-primary"
          onClick={generatePatientDetails}
          disabled={isRecording}
        >
          Patient Details
        </button>
        <br />
        <br />
        <div className="form-row">
          <label htmlFor="patientId" className="form-label">
            Patient ID:
          </label>
          <input
            type="number"
            id="patientId"
            name="patientId"
            className="form-input"
            value={patientId}
            required
            disabled={isRecording}
          />
        </div>
        <br />
        <div className="form-row">
          <label htmlFor="patientName" className="form-label">
            Patient Name:
          </label>
          <input
            type="text"
            id="patientName"
            name="patientName"
            className="form-input"
            value={patientName}
            required
          />
        </div>
        <br />
        <div className="form-row">
          <label htmlFor="patientAge" className="form-label">
            Patient Age:
          </label>
          <input
            type="number"
            id="patientAge"
            name="patientAge"
            className="form-input"
            value={patientAge}
            required
          />
        </div>
        <br />
        <div className="form-row">
          <label htmlFor="hospitalId" className="form-label">
            Hospital ID:
          </label>
          <input
            type="text"
            id="hospitalId"
            name="hospitalId"
            className="form-input"
            value={hospitalId}
            required
            disabled={isRecording}
          />
        </div>
        <br />
        <div className="form-row">
          <label htmlFor="prescription" className="form-label">
            Prescription:
          </label>
          <textarea
            id="prescription"
            name="prescription"
            className="form-input prescription-textarea" // Add a custom class for styling
            value={prescription}
            onChange={handlePrescriptionChange}
            style={{ width: '500px', height: '100px' }} // Set the height of the textarea
          />
        </div>
        <br />
        <button
          onClick={stopRecording}
          disabled={!isRecording}
          className="btn btn-block btn-secondary"
        >
          Print Prescription
        </button>
        <div style={{ position: 'absolute', bottom: '50px', right: '50px' }}>
          <RecordingIndicator isRecording={isRecording} />
        </div>
      </Form>
    </Wrapper>
  );
};

export default AddRecord;
