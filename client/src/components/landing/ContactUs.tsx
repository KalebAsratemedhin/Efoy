
const ContactUs = () => {
  return (
    <div className="h-full">
      <div className="text-center py-24">
        <h1 className="text-primary mb-4 text-5xl font-bold">Contact Us</h1>
        <h2 className="text-xl">
          We’re here to help and answer any questions you might have.
        </h2>
      </div>

      <div className="bg-white py-16 px-4 flex gap-2">
        <div className="w-1/3 overflow-hidden h-72">
          <img src="/contact-us.jpg" alt="contact us" />
        </div>
        <div className="w-2/3">
          <h2 className="text-secondary text-xl">Get in Touch</h2>
          <p className="text-gray-600">
            Whether you have a question about our services, need assistance, or just want to share your feedback, we're here to listen. Reach out to us through the form below, and we’ll get back to you as soon as possible.
          </p>
          <p className="text-gray-600 mt-5">
            You can also contact us directly at support@efoy.com or call us at (123) 456-7890. We look forward to hearing from you!
          </p>
        </div>
      </div>

      <section className="bg-primary text-white py-20">
        <div className="container mx-auto text-center">
          <h3 className="text-4xl font-bold mb-6">We’re Here for You</h3>
          <p className="text-xl mb-6">
            Reach out to us anytime, and we'll happily answer your questions.
          </p>
          <button className="px-8 py-4 bg-white text-primary text-xl rounded-md font-semibold">
            Contact Support
          </button>
        </div>
      </section>
    </div>
  );
};

export default ContactUs;
