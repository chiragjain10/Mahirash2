import React from 'react';
import { Link } from 'react-router-dom';
const blogPosts = [
    {
        id: 1,
        title: 'The Art of Perfumery: A Scented Journey',
        image: 'https://cdn.pixabay.com/photo/2016/06/20/04/30/perfume-1468031_1280.jpg',
        author: 'Admin',
        date: '25 Oct, 2023',
        excerpt: "Explore how the world's most luxurious perfumes are made — from the fields where ingredients are sourced to the finished product we proudly offer to our customers."
    },
    {
        id: 2,
        title: 'Choosing a Signature Scent for Every Season',
        image: 'https://cdn.pixabay.com/photo/2018/08/27/15/11/perfume-3635207_1280.jpg',
        author: 'Admin',
        date: '15 Nov, 2023',
        excerpt: 'Our guide to finding the perfect fragrance from our collection to suit every season and mood throughout the year.'
    },
    {
        id: 4,
        title: 'Behind the Bottle: Insights from a Master Perfumer',
        image: 'https://cdn.pixabay.com/photo/2017/06/26/23/47/perfume-2445617_1280.jpg',
        author: 'Admin',
        date: '12 Dec, 2023',
        excerpt: 'We share fascinating insights from industry experts on the inspiration and artistry behind the perfumes we stock.'
    },
   
];

const BlogList = () => {
    return (
        <div>
            <section className="tf-page-title">

                <div className="container-full-2 mx-0 mx-md-3  ">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="page-title-heading py-5">
                                <div className="text-center">
                                    <h2 className="text-3xl font-bold text-main uppercase">Our Journal</h2>
                                    <div className="w-16 h-1 bg-main mx-auto mt-4"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="tf-section-2 blog-list mx-0 mx-md-3">
                <div className="container-full-2">
                    <div className="row">
                        {blogPosts.map((post) => (
                            <div key={post.id} className="col-lg-4 col-md-6">
                                <article className="post-item-v2">
                                    <div className="post-img hover-img">
                                        <img src={post.image} alt={post.title} className="lazyload" style={{ width: '100%', height: '300px' }}/>
                                    </div>
                                    <div className="post-content">
                                        <div className="post-meta">
                                            <p className="text-black">By <span className="fw-medium">{post.author}</span> / <span className="fw-medium">{post.date}</span></p>
                                        </div>
                                        <h4 className="post-title">
                                            {post.title}
                                        </h4>
                                        <p className="post-excerpt">{post.excerpt}</p>
                                        {/* <Link to={`/blog/${post.id}`} className="tf-btn-line">
                                            <span>Read More</span>
                                            <i className="icon-arrow-top-right-2"></i>
                                        </Link> */}
                                    </div>
                                </article>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default BlogList; 