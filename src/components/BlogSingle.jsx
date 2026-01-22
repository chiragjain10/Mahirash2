import React from 'react';
import { useParams, Link } from 'react-router-dom';

const blogPosts = [
    {
        id: 1,
        title: 'The Art of Perfumery: A Scented Journey',
        image: 'images/blog/blog-single.jpg', // Use a larger image for single post view
        author: 'Admin',
        date: '25 Oct, 2023',
        content: `
            <p>The world of perfumery is a captivating blend of art and science, a tradition that dates back thousands of years. It begins with the careful selection of raw materials. From the blooming rose fields of Grasse, France, to the exotic spice markets of the East, each ingredient tells a story. The essence of these materials is extracted through various methods like distillation, enfleurage, or solvent extraction, each chosen to best preserve the delicate aromatic compounds.</p>
            <p>Once the essential oils and absolutes are obtained, the master perfumer, or "nose," begins the intricate process of composition. Like a composer creating a symphony, the perfumer layers different notes—top, middle, and base—to create a harmonious and evolving fragrance. The top notes are the first impression, light and volatile. The heart or middle notes form the core of the perfume, emerging as the top notes fade. Finally, the base notes provide depth and longevity, lingering on the skin for hours.</p>
            <blockquote className="style-1">
                "A perfume is a work of art, and the object that contains it must be a masterpiece."
                <div className="author-quote">
                    <img src="images/logo/logo-very-large.svg" alt="" className="logo-quote">
                    <span>Robert Ricci</span>
                </div>
            </blockquote>
            <p>This delicate balance is a testament to the perfumer's skill and intuition. The final creation is more than just a scent; it's an experience, a memory, and a form of personal expression, bottled with precision and passion. Each spray is an invitation to a sensory journey, a story waiting to unfold on the skin.</p>
        `
    },
    // In a real app, you would fetch all posts or the specific one by ID.
    // For this example, we'll just have one detailed post and other components will link to it.
];


const BlogSingle = () => {
    const { blogId } = useParams();
    // This is a simplified example. We'll find the post by ID, but for now we only have one detailed post.
    // A real implementation would fetch this data.
    const post = blogPosts.find(p => p.id.toString() === "1") || blogPosts[0]; // Fallback to the first post

    if (!post) {
        return <div>Post not found</div>;
    }

    return (
        <div>
            <section className="tf-page-title">
                <div className="container">
                    <div className="row">
                        <div className="col-md-12">
                            <ul className="breadcrumbs">
                                <li><Link to="/">Home</Link></li>
                                <li><Link to="/blog">Blog</Link></li>
                                <li>{post.title}</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <section className="tf-section-2 blog-single">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-10 offset-lg-1">
                            <article className="post-item-v3">
                                <div className="post-header">
                                    <h1 className="post-title-v3">{post.title}</h1>
                                    <div className="post-meta">
                                        <p className="text-black">By <span className="fw-medium">{post.author}</span> / <span className="fw-medium">{post.date}</span></p>
                                    </div>
                                </div>
                                <div className="post-img-v3">
                                    <img src={post.image} alt={post.title} />
                                </div>
                                <div className="post-content-v3" dangerouslySetInnerHTML={{ __html: post.content }}>
                                </div>
                            </article>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default BlogSingle; 