+++
title = "Exploring A Simple Attention Mechanism for Multi-omic Microbiomics"
date = "2025-12-12T13:55:22-08:00"
description = "NA"
tags = [
    "Machine Learning",
    "Multiomics",
    "Microbiome"
]
featured = true
+++

<script>
MathJax = {
  tex: { inlineMath: [['$', '$'], ['\\(', '\\)']] }
};
</script>
<script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
<script src="https://d3js.org/d3.v7.min.js"></script>

## Overview
<hr style="border: none; border-top: 2px solid black; margin: 0rem 0;">
<div style="margin-top: 2rem; margin-bottom: 2rem;"></div>

The following serves as an introduction to attention models and an exploration of the utility of these models for multi-omics through an example analysis of a Type II Diabetes (T2D) vs. Control experiment. I consider a _main_ **metagenomic** dataset and a _subordinate_ **blood serum** dataset using a modified version of [this model](https://academic.oup.com/bioinformatics/article/38/8/2287/6528310). The model used here is pictured below.

<div id="viz1"> </div>
<span style="display: block;font-size: small;color: grey;text-align: center;"><span style="font-weight: bold;">A simple attention model with three key steps:</span> (1) A linear layer mapping each feature in each dataset to <span style="font-weight: bold;">modules</span>. A module is encoded as a two-dim vector. (2) A <span style="font-weight: bold;">cosine similarity attention mechanism</span> describing similarity between modules, and (3) a fully connected prediction layer.</span>

<script src="/p1v1.js"></script>

<div style="margin-top: 2rem; margin-bottom: 2rem;"></div>

## Understanding the Model
<hr style="border: none; border-top: 2px solid black; margin: 0rem 0;">
<div style="margin-top: 2rem; margin-bottom: 2rem;"></div>

### Fitting the Model
---

Each **module** is a weighted linear combination of the the input data. Intuitively, each module is just a _two dimensional vector_ (pictured below). Consider we are encoding $M_x$ and $M_y$ modules for datasets $X \in \mathbb{R}^{N \times D_x}$ and $Y \in \mathbb{R}^{N \times D_y}$, respectively. If $\mathbf{x} \in \mathbb{R}^{D_x}$ is one sample from one of the datasets (e.g., metagenomics). The modules $\mathbf{M}(\mathbf{x}) \in \mathbb{R}^{M\_x \times 2}$ are *two dimensional, normalized, weighted linear combinations* of the observed data:

$$
\mathbf{M}(\mathbf{x}) = \begin{bmatrix}\mathbf{W^{(0)}}\mathbf{x} & \mathbf{W^{(1)}}\mathbf{x}\end{bmatrix}, \qquad \mathbf{M}(\mathbf{x})\_{i,\cdot} \leftarrow \frac{\mathbf{M}(\mathbf{x})\_{i,\cdot}} {\left\lVert \mathbf{M}(\mathbf{x})\_{i,\cdot} \right\rVert_2}
$$

where $\mathbf{W^{(0)}}, \mathbf{W^{(1)}} \in \mathbb{R}^{M\_x \times D\_x}$ are learned weight matrices for the two-dim module vectors and $||\mathbf{z}||\_2$ is the l2-norm. 

__Attention__ is calculated from the *cosine similarity* between two module vectors $\mathbf{M}(x)\_{i,\cdot}$ and $\mathbf{M}(y)\_{i,\cdot}$ (pictured below). Since the vectors are normalized, cosine similarity is the dot product:

$$
\cos(\theta) = \mathbf{M}(\mathbf{x})\_{i,\cdot} · \mathbf{M}(\mathbf{y})^\top\_{i,\cdot}
$$

<div style="margin-top: 2rem; margin-bottom: 1rem;"></div>

<div id="viz2"></div>
<span style="display: block;font-size: small;color: grey;text-align: center;"><span style="font-weight: bold;">Example Modules and Cosine Similarity:</span> Four metagenomics modules and one blood serum module are shown. Each module can be represented as a vector; attention is based on the cosine similarities between the metagenomic and blood serum modules. The angle $\theta$ and cosine similarity between modules B and E are shown. </span>

<div style="margin-top: 2rem; margin-bottom: 1rem;"></div>

Modules with larger cosine similarities are given higher __attention__. The __attention matrix__ $\mathbf{A} \in \mathbb{R}^{M\_x \times M\_y}$ is just the cosine similarities but with a column softmax applied. Intuitively, one column of the __attention matrix__ represents the proportion of attention *one* blood serum module assigns to all the metagenomic modules.

$$
\mathbf{A} = \\text{softmax}\_{\text{col}}\left(\mathbf{M}(\mathbf{x}) · \mathbf{M}(\mathbf{y})^\top\right)
$$

The __attention-weighted modules__ $\mathbf{T} \in \mathbb{R}^{M\_y \times 2}$ are a attention-weighted average of all the metagenomic modules for one blood serum module (pictured below):

$$
\mathbf{T} = \mathbf{A}^\top \textbf{M}(\textbf{x})
$$

<div id="viz3"></div>
<span style="display: block;font-size: small;color: grey;text-align: center;"><span style="font-weight: bold;">Example Cont. Attention Matrix & Weighted Modules:</span>
The attention matrix $\textbf{A}$ (right-most gray-scale matrix) represents attention weights blood serum module E assigns to metagenomic modules $A$-$D$. The metagenomic module vectors $\textbf{M}(\textbf{x})$ from the previous plot are shown again in the blue-scale matrix. Through the relationship $\mathbf{T} = \mathbf{A}^\top \textbf{M}(\textbf{x})$, the attention-weighted module $F$ (purple-scale) is obtained. Module vectors $A$-$F$ are depicted.</span>

### Module Feature Importances
---

Each module is a weighted, linear combination of the learned feature vectors. However, modules are normalized: only their *direction* matters. Yet feature vectors with larger magnitudes influence module direction more. __Feature importance__ measures the strength of the feature along the module’s final direction. Intuitively, feature importance represents how strongly a feature ‘voted’ in the module’s final direction (or the opposite direction for negative importance). Formally, it is the feature's magnitude projected onto the module direction. For feature $i$, module $a$, importance $I(i, a)$ is:
$$
I(i, a) = \left\lVert x\_{i} \times \mathbf{w}(i, a) \right\rVert_2 \times \cos(\theta) 
$$
where $\mathbf{w}(i,a)$ is the weights connecting feature $i$ to module $a$ and $\theta$ is the angle between the feature and module vectors. (Equivalently, $I(i, a) = \left(x\_{i} \times \mathbf{w}(i,a)\right) · \mathbf{M}(\mathbf{x})\_{a,\cdot}$).

<div id="viz4"></div>
<span style="display: block;font-size: small;color: grey;text-align: center;"><span style="font-weight: bold;">Three example feature importances for metagenomic module $D$.</span> <span style="font-weight: bold;">(Left Plot)</span> The importance for feature $i$ (green vector) for module $D$ (blue vector) is $I(i, D)$ (black vector). Feature vector $i$ has a large magnitude and points in a similar direction to module $D$, resulting in the large positive importance $I(i, D)=2.53$. <span style="font-weight: bold;">(Middle Plot).</span> Feature vector $j$ has a large magnitude but is almost orthogonal to $D$, resulting in a small importance of $I(j,D)=-0.18$. <span style="font-weight: bold;">(Right Plot)</span> Feature vector $k$ has a moderate magnitude pointing roughly in the opposite direction of $D$, resulting in a moderate negative importance of $I(k,D)=-0.5$.</span>
<div style="margin-top: 2rem; margin-bottom: 1rem;"></div>

<div style="margin-top: 2rem; margin-bottom: 1rem;"></div>

## Type II Diabetes Dataset Results
<hr style="border: none; border-top: 2px solid black; margin: 0rem 0;">
<div style="margin-top: 2rem; margin-bottom: 2rem;"></div>

We'll fit the attention model to this [Metacardis dataset](https://www.nature.com/articles/s41591-022-01688-4) (see [Zenodo](https://zenodo.org/records/6242715) and Github for data/analysis)
with 154 control samples and 85 T2D samples. The metagenomic data measured the absolute abundances of 59 genera with shotgun metagenomic sequencing and flow cytometry. The blood serum data measured 29 metabololites with Ultra-Performance Liquid Chromatography–Mass Spectrometry (UPLC–MS).

Four modules were used for the metagenomic and blood serum datasets. The fitted model had an __AUC of 0.97__ and an __accuracy of 0.93__ on the held out test set.

### Modules and Attention Results
---

<div style="margin-top: 2rem; margin-bottom: 1rem;"></div>

The module encodings and cosine-similarity attention matrices for the trained model are shown below. All values shown are the mean values across the training set (encodings/attention values differ across samples).

<div style="margin-top: 2rem; margin-bottom: 1rem;"></div>
<div id="viz5"></div>
<div style="margin-top: 2rem; margin-bottom: 1rem;"></div>

### Feature Importances
---

The importances for each module and for each blood serum metabolite / metagenomic genus are shown below. (__Note:__ only three metabolites with absolute importance $>=0.1$ in at least one blood serum module and only 28 genera with absolute importance $>=1$ in at least one metagenomic module are shown).

<div style="margin-top: 2rem; margin-bottom: 1rem;"></div>
<div id="viz6"></div>
<div style="margin-top: 2rem; margin-bottom: 1rem;"></div>

### Interpretation
---

The <span style="color: #1f77b4;">metagenomic modules A-D and features</span> are interpreted for each individual <span style="color: #d62728;">blood serum module E-H</span>:

- Module <span style="color: #d62728;">H</span>: In T2D, blood glucose tends to be elevated while glutamine is depleted. Module <span style="color: #d62728;">H</span> captures this pattern: when glucose signal is strong (T2D), it attends to metagenomic modules <span style="color: #1f77b4;">A/D</span>, and when weak (control), it attends to modules <span style="color: #1f77b4;">B/C</span>. Control-associated modules <span style="color: #1f77b4;">B/C</span> identify genera with beneficial gut-health associations including butyrate producers _Faecalibacterium_ and _Coprococcus_, and genera linked to improved insulin secretion/sensitivity: _Akkermansia_ and _Bacteroides_. In modules <span style="color: #1f77b4;">A/D</span> in T2D, beneficial genera  _Roseburia_ and _Bifidobacterium_ have negative importances, while genera with positive importances include _Bilophila_ (promotes intestinal barrier dysfunction leading to glucose dysmetabolism), _Collinsella_ (decreases liver glycogenesis and increases triglyceride synthesis), _Ruminococcus_ (promotes inflammatory cytokine production leading to insulin resistance), and _Streptococcus_ (related to inflammation).

- Module <span style="color: #d62728;">E</span>: This module attends to metagenomic modules <span style="color: #1f77b4;">A/D</span> in both Control and T2D, and aligns with glucose and lactic acid. It identifies the distinct genera in modules <span style="color: #1f77b4;">A/D</span> that cause these modules to point in somewhat different directions in Control vs. T2D. In Control, for instance, modules <span style="color: #1f77b4;">A/D</span> place more importance on some known beneficial genera including _Coprococcus_ and _Odoribacter_. 

- Module <span style="color: #d62728;">F</span>: Lactic acid can be elevated in individuals with T2D due to, for instance, decreased blood flow in adipose tissue (common in obesity). This module attends to metagenomic modules <span style="color: #1f77b4;">A/D</span> when lactic acid is sufficiently elevated (i.e., in T2D), but the signal is destroyed when overridden by glutamine (i.e., in Control).

- Module <span style="color: #d62728;">G</span>: Not particularly well aligned with any blood serum metabolites.

<script src="/p1v2.js"></script>

## Discussion
<hr style="border: none; border-top: 2px solid black; margin: 0rem 0;">
<div style="margin-top: 2rem; margin-bottom: 2rem;"></div>

The following are some loosely associated concluding points:

- __Reproducibility__: I am skeptical of the reproducibility of these results. Other methods (e.g., [sGCCA-based MintTea](https://www.nature.com/articles/s41467-024-46888-3)) use data subsampling to derive consensus modules. Perhaps dropout in the linear encoding of the modules could be similarly used. Furthermore, training on multiple datasets across studies could help. 

- __Some Surprising Results__: Some genera do not match expectations. For example, _Eubacterium_, although a beneficial Butyrate producer, unexpectedly has negative importance in Control modules B/C and positive importance in T2D module D. Three potential hypotheses for this: (1) this analysis used _absolute_ abundances while many studies consider _relative_ abundances. Reanalyzing the data using relative abundances (i.e., CLR transformed abundances) might produce results more concordant with prior studies. (2) The model suffered from limited expressibility due to only using 4 modules and only two module directions. (3) This may just be a reproducibility issue: a study specific result. 

- __Improving Interpretation__: While not performed here, an enrichment analysis on each module using annotated microbe sets could help interpret each module. However, using known sets defeats the purpose of identifying novel sets.

## Code
<hr style="border: none; border-top: 2px solid black; margin: 0rem 0;">
<div style="margin-top: 2rem; margin-bottom: 2rem;"></div>


The full code is provided here on [GitHub](https://github.com/kyle-mcgovern/exploring_multiomic_attn), but the main model code is:

```python
class MultiOmicsModuleAtt(nn.Module):
    def __init__(self, feature_dim_a, feature_dim_b, num_modules_a,
                 num_modules_b, hidden_dim, out_dim=1):
        """
        Args:
            feature_dim_a: Da (# features dataset xa)
            feature_dim_b: Db (# features dataset xb)
            num_modules_a: Number modules desired for dataset xa
            num_modules_b: Number modules desired for dataset xb
            hidden_dim: Final layer hidden dim
            out_dim: Final output dim (1 for binary classification)
        """
        super().__init__()
        self.num_modules_a = num_modules_a
        self.num_modules_b = num_modules_b
        self.encoder_ax = nn.Linear(feature_dim_a, num_modules_a,
                                    bias=False)
        self.encoder_ay = nn.Linear(feature_dim_a, num_modules_a,
                                    bias=False)
        self.encoder_bx = nn.Linear(feature_dim_b, num_modules_b,
                                    bias=False)
        self.encoder_by = nn.Linear(feature_dim_b, num_modules_b,
                                    bias=False)
        self.fc1 = nn.Linear((num_modules_b) * 2, hidden_dim)
        self.fc2 = nn.Linear(hidden_dim, out_dim)

    def forward(self, xa, xb):
        """
        Args:
            xa: Dominant dataset matrix
                (N, Da) for N (# samples), Da (# features)
            xb: Subordinate data set (N, Db)
        """
        # Encode (x, y) vector coordinates for input datasets xa, xb
        enc_ax = self.encoder_ax(xa)
        enc_ay = self.encoder_ay(xa)
        enc_bx = self.encoder_bx(xb)
        enc_by = self.encoder_by(xb)
        # Concatenate (x, y) vector coordinate values
        enc_a = torch.stack([enc_ax, enc_ay], dim=2)
        enc_b = torch.stack([enc_bx, enc_by], dim=2)
        # L2 Normalization of each module vector
        enc_a = F.normalize(enc_a, p=2, dim=2)
        enc_b = F.normalize(enc_b, p=2, dim=2)
        # Raw Attention Matrix (raw cosine similarities)
        raw_attn = enc_a @ (enc_b.transpose(1, 2))
        # Softmax Attention matrix (probabilities)
        attn_a = F.softmax(raw_attn, dim=1)
        # Attention-encoded modules for xa
        att_enc_a = attn_a.transpose(1, 2) @ enc_a
        # Flatten attention-encoded modules, and predict 
        att_enc_a_flat = att_enc_a.view(-1, self.num_modules_b*2)
        out = self.fc1(att_enc_a_flat)
        out = F.relu(out)
        out = self.fc2(out)
        return out.squeeze(1)
```


