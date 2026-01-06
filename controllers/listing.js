const Listing = require("../models/listing");

module.exports.index = async(req , res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs",{allListings});
};

module.exports.rendernewform = (req, res) => {
    res.render("listings/new.ejs");
}

module.exports.showListings = async(req, res)=>{
    let{id} = req.params;
    const listing = await Listing.findById(id).populate({path:"reviews",populate:{
        path:"author"
    }}).populate("owner");
    if(!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs",{listing})
}

module.exports.createListing = async(req,res ,next)=>{
    const newlistings = new Listing(req.body.listing);
    newlistings.owner = req.user._id;
    if(req.file){
        let url=req.file.path;
        let filename=req.file.filename;
        newlistings.image={url,filename};
    }
    await newlistings.save();
    req.flash("success", "listing successfull ");
    res.redirect("/listings");   
}

module.exports.editListing = async(req,res) =>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    req.flash("success", "listing edited ");
    res.render("listings/edit.ejs",{listing});
}

module.exports.updateListing = async(req,res)=>{
    let {id} = req.params
    let listing = await Listing.findByIdAndUpdate(id , {...req.body.listing});
    if(req.file){
        let url=req.file.path;
        let filename=req.file.filename;
        listing.image={url,filename};
        await listing.save();
    }
    req.flash("success", "listing updated ");
    res.redirect("/listings");
}

module.exports.deleteListing =async (req,res) =>{
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "listing deleted ");
    res.redirect("/listings");
}
