+++
title = "Failure Modes of SparCC and Building Toward an Alternative"
date = "2026-06-26T13:55:22-08:00"
description = "NA"
tags = [
    "SparCC",
    "Statistics",
    "Correlation",
    "Microbiome"
]
featured = true
aliases = ["/sparcc-toward-alternative/"]
summary = "Identifying Issues with SparCC and an Alternative Approach"
image = "images/sparcc.png"
+++

<script>
window.MathJax = {
  tex: {
    inlineMath: [['$', '$'], ['\\(', '\\)']],
    displayMath: [['$$', '$$'], ['\\[', '\\]']],
    packages: {'[+]': ['ams', 'xcolor']},
    loader: {
      load: ['[tex]/ams']
    }
  }
};
</script>
<script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
<script src="https://d3js.org/d3.v7.min.js"></script>

## Summary

During my PhD I developed robust tools to address the *scale limitation* of sequence count data which refers to the fact sequence count data measure only relative abundances, and not absolute abundances. This limitation stems from the fact that the \# of reads sequenced is independent of the *scale* (e.g., total gut microbial load or total transcription). Here I explore how SparCC [1] rather briliantly addresses the scale limitation, when SparCC fails, and an alternative Bayesian approach that can avoid the failure modes of SparCC.

See Code section at end or [GitHub](https://github.com/kyle-mcgovern/exploring_sparcc_correlation) repo for full code.

## Absolute Abundances, Relative Abundances, Scale
<hr style="border: none; border-top: 2px solid black; margin: 0rem 0;">
<div style="margin-top: 2rem; margin-bottom: 2rem;"></div>
For $D$ taxa (or genes) and $N$ samples/individuals we define:
<ul>
    <li>$W$: A $D \times N$ matrix of <span style="font-weight: bold;">absolute abundances</span></li>
    <li>$W^\text{rel}$: A $D \times N$ matrix of <span style="font-weight: bold;">relative abundances</span></li>
    <li>$W^\text{tot}$: A $N$-vector of <span style="font-weight: bold;">scale</span> (e.g., total gut microbial load)</li>
</ul>

The relationship between the absolute abundaces $W$, relative abundances $W^\text{rel}$ and scale $W^\text{tot}$ for each taxon $d$ and sample $n$ is:
\[
\begin{aligned}
    W_{dn} &= W^\text{rel}_{dn}W^\text{tot}_n \\
    W^\text{rel}_{dn} &= \frac{W_{dn}}{W^\text{tot}_n} \\
    W^\text{tot}_n &= \sum_{d=1}^D W_{dn}
\end{aligned}
\]

Here is a toy example of the absolute abundance matrix $W$ and the scale vector $W^\text{tot}$:

<div style="text-align: center;">
<table style="display: inline-table; width: auto; border-collapse: collapse; border: 1px solid #999;">
  <thead>
    <tr>
      <th style="border: 1px solid #999; padding: 0.5em;">$W$</th>
      <th style="border: 1px solid #999; padding: 0.5em;">Sample #1</th>
      <th style="border: 1px solid #999; padding: 0.5em;">Sample #2</th>
      <th style="border: 1px solid #999; padding: 0.5em;">Sample #3</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border: 1px solid #999; padding: 0.5em;">Taxon A</td>
      <td style="border: 1px solid #999; padding: 0.5em;">100</td>
      <td style="border: 1px solid #999; padding: 0.5em;">50</td>
      <td style="border: 1px solid #999; padding: 0.5em;">200</td>
    </tr>
    <tr>
      <td style="border: 1px solid #999; padding: 0.5em;">Taxon B</td>
      <td style="border: 1px solid #999; padding: 0.5em;">20</td>
      <td style="border: 1px solid #999; padding: 0.5em;">40</td>
      <td style="border: 1px solid #999; padding: 0.5em;">100</td>
    </tr>
    <tr>
      <td style="border: 1px solid #999; padding: 0.5em;">Taxon C</td>
      <td style="border: 1px solid #999; padding: 0.5em;">80</td>
      <td style="border: 1px solid #999; padding: 0.5em;">10</td>
      <td style="border: 1px solid #999; padding: 0.5em;">100</td>
    </tr>
    <tr>
      <td style="border: 1px solid #999; padding: 0.5em;">$W^\text{tot}$</td>
      <td style="border: 1px solid #999; padding: 0.5em;">200</td>
      <td style="border: 1px solid #999; padding: 0.5em;">100</td>
      <td style="border: 1px solid #999; padding: 0.5em;">400</td>
    </tr>
  </tbody>
</table>
</div>

And the corresponding relative abundances matrix $W^\text{rel}$:

<div style="text-align: center;">
<table style="display: inline-table; width: auto; border-collapse: collapse; border: 1px solid #999;">
  <thead>
    <tr>
      <th style="border: 1px solid #999; padding: 0.5em;">$W^\text{rel}$</th>
      <th style="border: 1px solid #999; padding: 0.5em;">Sample #1</th>
      <th style="border: 1px solid #999; padding: 0.5em;">Sample #2</th>
      <th style="border: 1px solid #999; padding: 0.5em;">Sample #3</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border: 1px solid #999; padding: 0.5em;">Taxon A</td>
      <td style="border: 1px solid #999; padding: 0.5em;">0.5</td>
      <td style="border: 1px solid #999; padding: 0.5em;">0.5</td>
      <td style="border: 1px solid #999; padding: 0.5em;">0.5</td>
    </tr>
    <tr>
      <td style="border: 1px solid #999; padding: 0.5em;">Taxon B</td>
      <td style="border: 1px solid #999; padding: 0.5em;">0.1</td>
      <td style="border: 1px solid #999; padding: 0.5em;">0.4</td>
      <td style="border: 1px solid #999; padding: 0.5em;">0.25</td>
    </tr>
    <tr>
      <td style="border: 1px solid #999; padding: 0.5em;">Taxon C</td>
      <td style="border: 1px solid #999; padding: 0.5em;">0.4</td>
      <td style="border: 1px solid #999; padding: 0.5em;">0.1</td>
      <td style="border: 1px solid #999; padding: 0.5em;">0.25</td>
    </tr>
  </tbody>
</table>
</div>


## The Problem Estimating Correlations from Sequence Counts
<hr style="border: none; border-top: 2px solid black; margin: 0rem 0;">
<div style="margin-top: 2rem; margin-bottom: 2rem;"></div>

SparCC [1] aims to estimate correlations in the <span style="font-weight: bold;">absolute abundances</span> of various taxa. Its goal is to answer questions like: in the Crohn's disease gut, is the abundance of butyrate-producer *Faecalibacterium* negatively correlated with inflammatory-response-related *Ruminococcus*?

To define this correlation, let $\sigma^2_i=\text{var}(\log W_{i\cdot})$ and $\sigma_{ij} = \text{cov}(\log W_{i\cdot}, \log W_{j\cdot})$, then the log correlation is:
\[
\begin{aligned}
\rho_{ij} &\equiv \text{corr}(\log W_{i\cdot}, \log W_{j\cdot}) \\
          &= \frac{\sigma_{ij}}{(\sigma_i\sigma_j)}
\end{aligned}
\]

As an example, I will use a Vandeputte study [2] measuring 40 taxa in 66 healthy individuals because it has flow cytometry measurements of microbial load (i.e., scale). Combining the microbial load measurements (i.e., scale measurements) with sequence count data (i.e., relative abundance measurements), we can estimate the correlations in the absolute abundances:

<script src="/p2v1.js"></script>
<div id="viz1"> </div>

The problem we have is that <span style="font-weight: bold;">sequence count data only measure relative abundances</span>. From sequence count data we can only estimate the *correlations of relative abundances* $\rho^\text{rel}_{ij}$:

$$
\rho_{ij}^\text{rel} = \frac{\sigma^\text{rel}_{ij}}{(\sigma^\text{rel}_i \sigma^\text{rel}_j)}
$$

As we can see, the correlations in relative abundances estimated from the sequence count data in the Vandeputte study are *substantially* different from the absolute abundance correlations:

<script src="/p2v2.js"></script>
<div id="viz2"> </div>

## SparCC
<hr style="border: none; border-top: 2px solid black; margin: 0rem 0;">
<div style="margin-top: 2rem; margin-bottom: 2rem;"></div>

### SparCC Theory \& Math

The problem we have estimating $\rho_{ij}$ is we don't know the covariance $\sigma_{ij}$ nor variance \(\sigma^2_i\) in log absolute abudnance; we only measure relative abundances with sequence count data. To solve this, SparCC imposes a *sparsity assumption* (more on this in a bit). It turns out, this assumption allows us to estimate $\rho_{ij}$ purely as a function of *log-ratios*. The advantage of log-ratios is that they are scale invariant, i.e., they are the same whether estimated from relative or absolute abundance data. To show this, consider the variance in the log-ratio between taxa $i$ and $j$, $t_{ij}$, can be written as:

\[
\begin{aligned}
t_{ij} &\equiv \text{var}\left[\log \frac{W_{i\cdot}}{W_{j\cdot}}\right] \\
       &= \text{var}\left[\log \frac{W_{i\cdot}^\text{rel}W^\text{tot}}{W_{j\cdot}^\text{rel}W^\text{tot}}\right] \\
       &= \text{var}\left[\log \frac{W_{i\cdot}^\text{rel}}{W_{j\cdot}^\text{rel}}\right]
\end{aligned}
\]

This means we can directly estimate $t_{ij}$ from sequence count data, furthermore:
\[
\begin{aligned}
t_{ij} &\equiv \text{var}\left[\log \frac{W_{i\cdot}}{W_{j\cdot}}\right] \\
&= \text{var}\left[\log W_{i\cdot}\right] + \text{var}\left[\log W_{i\cdot}\right] - 2\text{cov}\left[\log W_{i\cdot}, \log W_{j\cdot}\right] \\
&\equiv \sigma_{i}^2 + \sigma_j^2 + \sigma_{ij} \\
&= \sigma_{i}^2 + \sigma_j^2 + \rho_{ij}\sigma_i\sigma_j
\end{aligned}
\]

Therefore the correlation is:
$$
\rho_{ij} = \frac{\sigma_i^2 + \sigma_j^2 - t_{ij}}{2\sigma_i\sigma_j}
$$

The average variance in the log-ratio for any taxon $i$ can then be written as (note, $t_{ii}=0$):

\[
\begin{aligned}
t_i &\equiv \sum_{j=1}^D t_{ij} = (D-1) \sigma_i^2 + \sum_{j \neq i} \sigma_j^2 + 2 \sum_{j \neq i} \rho_{ij} \sigma_i \sigma_j
\end{aligned}
\]

The <span style="font-weight: bold;">sparsity assumpition</span> refers to the assumption most correlations are near-zero/cancel out:
\[
(D-1) \sigma_i^2 + \sum_{j \neq i} \sigma_j^2 \gg 2 \sum_{j \neq i} \rho_{ij} \sigma_i \sigma_j
\]

We can first derive a solution for $\sum_{i=j}^D \sigma^2$, which then can be used to derive a solution for $\sigma_i^2$. Using the <span style="font-weight: bold;">sparsity assumpition</span>, we can write:
\[
\begin{aligned}
t_{i} &\simeq (D-1) \sigma_i^2 + \sum_{j \neq i} \sigma_j^2 \\
      &= (D-1) \sigma_i^2 + \sum_{j} \sigma_j^2 - \sigma_i^2 \\
      &= (D-2) \sigma_i^2 + \sum_{j} \sigma_j^2 \\
\sum_{i} t_{i} &= (D-2) \sum_{i} \sigma_i^2 + D \sum_{i} \sigma_i^2 \\
\sum_{i} \sigma_i^2 &= \frac{\sum_{i} t_i}{(2D-2)}
\end{aligned}
\]
(Note $\sum_{i} \sigma_i^2=\sum_{j} \sigma_j^2$). Plugging in $\sum_{j} \sigma_j^2 = \frac{\sum_{j} t_j}{(2D-2)}$ we can derive:
\[
\begin{aligned}
t_i &= (D-2) \sigma_i^2 + \frac{\sum_{j} t_j}{(2D-2)} \\
\sigma_i^2 &= \frac{t_i - \frac{\sum_{j} t_j}{(2D-2)}}{D-2}
\end{aligned}
\]

This estimate of $\sigma_i^2$ can then be used to solve for the correlation:
$$
\rho_{ij} = \frac{\sigma_i^2 + \sigma_j^2 - t_{ij}}{2\sigma_i\sigma_j}
$$

### SparCC Algorithm

One final issue is zeros and counting uncertainty in sequence count data. To solve this, we can estimate the correlation multiple times after estimating the relative abundances $W^\text{rel}$. For each sample $n$, we estimate the relative abundances using a Multinomial-Dirichlet distribution, which for sequence counts $Y$ is:
\[
W^\text{rel}_{\cdot n} = \text{Dirichlet}\left(Y_{\cdot n} + 0.5\right)
\]

Loop over the following steps $S$ times to get a distribution of correlation estimates (see Code section for full code or [GitHub](https://github.com/kyle-mcgovern/exploring_sparcc_correlation)):
<ol>
    <li>Sample estimate of relative abundances $W^\text{rel}$ as:</li>    
\[
W^\text{rel}_{\cdot n} \sim \text{Dirichlet}\left(Y_{\cdot n} + 0.5\right)
\]
<li>Use this $W^\text{rel}$ to get log-ratio estimates:</li>
\[
\begin{aligned}
t_{ij} &= \text{var}\left[\log \frac{W^\text{rel}_{i\cdot}}{W^\text{rel}_{j\cdot}}\right] \\
t_{i} &= \sum_{j \neq i} t_{ij}
\end{aligned}
\]
<li>Estimate the log absolute abundance variances as:</li>
\[
\sigma_i^2 = \frac{t_i - \frac{\sum_{j} t_j}{(2D-2)}}{D-2}
\]
<li>Finally estimate the correlations:</li>
\[
\rho_{ij} = \frac{\sigma_i^2 + \sigma_j^2 - t_{ij}}{2\sigma_i\sigma_j}
\]
</ol>

### SparCC Fails When the Sparsity Assumption is Violated

Returning to the Vadeputte study, here I show the correlation estimates for two taxa against all other taxa: 
<ol>
    <li><span style="font-weight: bold;">Oscillibacter:</span> where $\sum_{j \neq i} \rho_{ij} = 0.295$, violating SparCC's sparsity assumption</li>
    <li><span style="font-weight: bold;">Prevotella:</span> where $\sum_{j \neq i} \rho_{ij} = -0.006$, satisfying SparCC's sparsity assumption</li>
</ol>
We more-or-less know the true absolute abundances, thanks to Vandeputte's flow cytometry measurements of microbial load (i.e., scale). We can therefore use this dataset to benchmark SparCC:
<div style="margin-top: 2rem; margin-bottom: 3rem;"></div>
<script src="/p2v3.js"></script>
<div id="viz3"> </div>

Notice that for *Oscillibacter*, where the SparCC assumption is violated, SparCC's 95\% credible intervals fail to cover the true correlations $\rho_{ij}$. The sparsity assumption assumes the average correlation is $\approx 0$, yet the average correlation for *Oscillibacter* is $0.295$, thus SparCC severly underestimates correlation. SparCC would conclude here that *Faecalibacterium* is negatively correlated with *Oscillibacter* even though it is positively correlated. However for *Prevotella*, where the sparsity assumption is valid, the SparCC estimates are more or less correct across the board.

## BpimC: Bayesian Partially Identified Models for Correlation
<hr style="border: none; border-top: 2px solid black; margin: 0rem 0;">
<div style="margin-top: 2rem; margin-bottom: 2rem;"></div>

### Math \& Justifying Theory

Here I will develop an approach based on Bayesian partially identified models (see this paper for more info [3]). In summary, these models allow us to assign a probability distribution representing uncertainty in the unmeasured scale. By sampling from these distributions, our model can be more robust as it does not rely on a more strict assumption about scale, like SparCC's sparsity assumption. (Note, SparCC's sparsity assumption implies some assumptions about the $W^\text{tot}$ to allow estimation of $\sigma_i^2$, but I do not derive that assumption here).

We can start by decomposing the covariance in absolute abundances into its relative abundances and scale components. To do this, I'll define:
<ul>
    <li>$\rho_{ij}^\text{rel,rel}=\text{corr}(\log W^\text{rel}_{i\cdot}, \log W^\text{rel}_{j\cdot})$</li>
    <li>$\rho_{i}^\text{rel,tot}=\text{corr}(\log W^\text{rel}_{i\cdot}, \log W^\text{tot})$</li>
</ul>

Then the covariance for two taxa/genes $i$ and $j$ is:
\[
\begin{aligned}
\sigma_{ij} &\equiv \text{cov}\left(\log W_{i, \cdot}, \log W_{j, \cdot}\right) \\
&= \text{cov}\left(\log W^\text{rel}_{i, \cdot} + \log W^\text{tot}, \log W^\text{rel}_{j, \cdot} + \log W^\text{tot}\right) \\
&= \sigma^\text{rel}_{i} \sigma^\text{rel}_j \rho^{\text{rel},\text{rel}}_{ij} + \sigma^\text{rel}_{i} \color{red}\sigma^\text{tot} \rho^{\text{rel},\text{tot}}_i\color{black} + \sigma^\text{rel}_{j} \color{red}\sigma^\text{tot} \rho^{\text{rel},\text{tot}}_j\color{black} + \color{red}{\sigma^{\text{tot}}}^2\color{black} \\
\end{aligned}
\]

<span style="color: red;">Quantities not measured by sequence count data (i.e., that depend on scale) are highlighted in red.</span> In vector notation, we can express the above as:
\[
\begin{aligned}
\Sigma &\equiv \text{cov}\left(\log W, \log W\right) \\
&= \text{cov}\left(\log W^\text{rel}, \log W^\text{rel}\right) + \color{red}\sigma^\text{tot}\color{black}\left(\sigma^\text{rel} \circ \color{red}\rho^{\text{rel},\text{tot}}\color{black}\right)\pmb{1}^\top + \color{red}\sigma^\text{tot}\color{black}\pmb{1}\left(\sigma^\text{rel} \circ \color{red}\rho^{\text{rel},\text{tot}}\color{black}\right) + \color{red}{\sigma^\text{tot}}^2\color{black} \pmb{1}_{D \times D}
\end{aligned}
\]
where $\circ$ indicates the Hadamard product. Then the correlation $\rho_{ij}$ is just the normalized covarince $\sigma_{ij}$.

The idea behind <span style="font-weight: bold;">BpimC</span> is to sample estimates of the unmeasured scale quantities from user defined distributions of uncertainty. This includes the scalar variance in absolute abundance ${\sigma^\text{tot}}^2$, and the $D$-length vector in correlation between the relative abundances and scale $\rho^{\text{rel},\text{tot}}$:
\[
\begin{aligned}
{\sigma^\text{tot}}^2 &\sim P_{{\sigma^\text{tot}}^2} \\
\rho^{\text{rel},\text{tot}} &\sim P_{\rho^{\text{rel},\text{tot}}}
\end{aligned}
\]
These can then be plugged in to estimate $\rho_{ij}$. Note the following two things about the correlation:
<ul>
    <li>It must be true ${\sigma^\text{tot}}^2>0$, therefore if $\sigma^\text{rel}_{i} \sigma^\text{rel}_j \rho^{\text{rel},\text{rel}}_{ij}>0$ the only way it might be true that $\rho_{ij}<0$ is if $\rho^{\text{rel},\text{tot}}_i<0$ and/or $\rho^{\text{rel},\text{tot}}_j<0$ </li>
    <li>If $\sigma^\text{rel}_{i} \sigma^\text{rel}_j \rho^{\text{rel},\text{rel}}_{ij}<0$, then $\rho_{ij}>0$ only if ${\sigma^\text{tot}}^2$, $\rho^{\text{rel},\text{tot}}_i$, and/or $\rho^{\text{rel},\text{tot}}_j$ are sufficiently large and positive</li>
</ul>

### BpimC Algorithm

Loop over the following steps $S$ times to get a distribution of correlation estimates (see Code section for full code or [GitHub](https://github.com/kyle-mcgovern/exploring_sparcc_correlation)):
<ol>
    <li>Sample estimate of relative abundances $W^\text{rel}$ as:</li>    
\[
W^\text{rel}_{\cdot n} \sim \text{Dirichlet}\left(Y_{\cdot n} + 0.5\right)
\]

<li> Sample scale components from user-defined probability distributions $P_{{\sigma^\text{tot}}^2}$ and $P_{\rho^{\text{rel},\text{tot}}}$:
\[
\begin{aligned}
{\sigma^\text{tot}}^2 &\sim P_{{\sigma^\text{tot}}^2} \\
\rho^{\text{rel},\text{tot}} &\sim P_{\rho^{\text{rel},\text{tot}}}
\end{aligned}
\]

<li>Estimate the covariance in absolute abundance as:</li>
\[
\sigma_{ij} = \sigma^\text{rel}_{i} \sigma^\text{rel}_j \rho^{\text{rel},\text{rel}}_{ij} + \sigma^\text{rel}_{i} \sigma^\text{tot} \rho^{\text{rel},\text{tot}}_i + \sigma^\text{rel}_{j} \sigma^\text{tot} \rho^{\text{rel},\text{tot}}_j + {\sigma^{\text{tot}}}^2
\]

<li>Convert covariance $\Sigma$ into correlations</li>
</ol>

### BpimC Avoids SparCC's Failure Condition

Here I reanalyze the Vadeputte study just like before with SparCC: using the sequence count data, with the ground truth determined separately by the flow cytometry measurements of scale. I use the following distributions for the unmeasured scale terms:
\[
\begin{aligned}
{\sigma^\text{tot}}^2 &\sim \text{Uniform}[0.4, 0.8] \\
\rho^{\text{rel},\text{tot}} &\sim \text{Uniform}[m-0.3, m+0.3] \\
m &\sim \text{Uniform}[0, 0.15]
\end{aligned}
\]

This produced the following BpimC 95\% credible intervals for *Oscillibacter* and *Prevotella*:
<div style="margin-top: 2rem; margin-bottom: 3rem;"></div>
<script src="/p2v4.js"></script>
<div id="viz4"> </div>

Unlike SparCC, BpimC's 95\% credible intervals correctly cover the correlations for both *Oscillibacter* and *Prevotella*.

I'll finish this post off with the following points in no particular order:
<ul>
    <li>The credible intervals of BpimC are noticably wider than those produced by SparCC. This is because BpimC adds extra uncertainty on top of the Dirichelet model of counts. A drawback of BpimC is that the extra uncertainty can reduce power.</li>
    <li>BpimC's estimates are a bit too low for Oscillibacter, but too high for Prevotella. The issue is that the distributions $P_{{\sigma^\text{tot}}^2}$ and $P_{\rho^{\text{rel},\text{tot}}}$ are not ideally defined. The choice of these distributions is not trivial. I do not develop a full theory here, but ultimately any uncertainty is better than no uncertainty. You can also do a sensitivity analysis, basically asking how sensitive a conclusion like "these taxa are positively correlated" stands up to wider and wider distributions.
 </li>
    <li>Ideally the distributions $P_{{\sigma^\text{tot}}^2}$ and $P_{\rho^{\text{rel},\text{tot}}}$ would be centered around the SparCC sparsity assumption. However, I have not derived here values of ${{\sigma^\text{tot}}^2}$ and $\rho^{\text{rel},\text{tot}}$ implied by the sparsity assumption (Can they be derived?)</li>
</ul>

## Code
<hr style="border: none; border-top: 2px solid black; margin: 0rem 0;">
<div style="margin-top: 2rem; margin-bottom: 2rem;"></div>

### SparCC

```R
library(abind)
library(rBeta2009)

sparcc_basis <- function(P) {
  taxa_names <- row.names(P)
  T_mat <- matrix(0, nrow=nrow(P), ncol=nrow(P))
  for (i in 1:nrow(P)) {
    for (j in 1:nrow(P)) {
      T_mat[i, j] <- var(log(P[i,]/P[j,]))
    }
  }
  T_sum <- apply(T_mat, 1, sum)
  A <- c()
  for(i in 1:nrow(P)) {
    D <- nrow(P)
    A[i] <- ((T_sum[i] - (sum(T_sum) / (2*D-2))) / (D-2))
  }
  corr_mat <- matrix(0, nrow=nrow(P), ncol=nrow(P))
  for (i in 1:nrow(P)) {
    for (j in 1:nrow(P)) {
      corr_mat[i, j] <- (A[i] + A[j] - T_mat[i,j]) / (2*sqrt(A[i])*sqrt(A[j]))
    }
  }
  row.names(corr_mat) <- taxa_names
  colnames(corr_mat) <- taxa_names
  return(corr_mat)
}

sparcc <- function(Y, nsample=1000) {
  corr_mats <- c()
  for (iter in 1:nsample) {
    P_sample <- apply(Y, 2, function(col) rdirichlet(1, col+0.5))
    corr_mat <- sparcc_basis(P_sample)
    corr_mats <- abind(corr_mats, corr_mat, along=3)
  }
  return(corr_mats)
}

```

### BpimC

```R
library(abind)
library(rBeta2009)

#' Estimates absolute abundance correlations given relative abundances,
#' scale variance, and correlations between each taxon and scale.
#' 
#' @param rel_abund a D x N matrix. D taxa, N samples, relative
#'        abundances cols sum to 1
#' @param scale_var A number. The variane in the scale
#' @param scale_rel_corr A vector. A D-length vector of correlation
#'        between each taxon's abundance and scale.
#' @return An estimated DxD absolute abundance correlation
#'         matrix
absCorrEst <- function(rel_abund, scale_var, scale_rel_corr) {
  D <- nrow(rel_abund)
  # D relative abundance variances
  rel_var <- cbind(apply(log(rel_abund), 1, var))
  # Vector of 1s
  v1 <- cbind(rep(1, D))
  # Relative abundance covariance
  Lambda <- cov(log(t(rel_abund)))
  # Scale/rel sd
  scale_sigma <- sqrt(scale_var)
  rel_sigma <- sqrt(rel_var) 
  # Absolute abundance covariance estimate
  abs_cov <- Lambda + (scale_sigma * (rel_sigma * scale_rel_corr))%*%t(v1)
  abs_cov <- abs_cov + v1%*%t(scale_sigma * (rel_sigma * scale_rel_corr))
  abs_cov <- abs_cov + scale_var*matrix(1, D, D)
  # Return correlation matrix
  return(cov2cor(abs_cov))
}

#' BpimC Code
#'
#' @param Y D x N matrix of sequence counts. D taxa, N samples.
#' @param scale_var_sampler A function. Returns a sampled estimate
#'        of scalar variance in scale
#' @param scale_rel_sampler A function. Returns a D-length vector
#'        of estimates of correlation between relative abundances
#'        and scale.
#' @param scale_var_args A list. Arguments to pass to scale_var_sampler 
#' @param scale_rel_args A list. Arguments to pass to scale_rel_sampler 
#' @param nsample A numeric. The number of estimates of corr to sample.
#' @return A D x D x S array. S estimates of D x D correlation matrices
bpimC <- function(Y, scale_var_sampler, scale_rel_sampler,
   			      scale_var_args=list(), scale_rel_args=list(),
			      nsample=1000) {
  taxa_names <- row.names(Y)
  all_abs_corr <- c() 
  for(i in 1:nsample) {
    # Sample scale args
    scale_var <- do.call(scale_var_sampler, c(list(n = 1), scale_var_args))
    scale_rel_corr <- do.call(scale_rel_sampler, c(list(n=1), scale_rel_args))
    # Dirichlet Sample Relative Abundances
    P_sample <- apply(Y_genus, 2, function(col) rdirichlet(1, col+0.5))
    # Estimate absolute correlations
    abs_corr <- cov2cor(absCorrEst(P_sample, scale_var, scale_rel_corr))
    all_abs_corr <- abind(all_abs_corr, abs_corr, along=3)
  }
  row.names(all_abs_corr) <- taxa_names
  colnames(all_abs_corr) <- taxa_names
  return(all_abs_corr)
}
```

### Example Vandeputte BpimC Analysis

```R
## Bayesian Sampling Correlation Analysis
scale_var_sampler <- function(n, s_l, s_u) {
  return(runif(n, s_l, s_u))
}
scale_rel_sampler <- function(n, D, m_l, m_u, r_l, r_u) {
  m <- runif(n, m_l, m_u)
  scale_rel_corr <- runif(D, m+r_l, m+r_u)
  return(scale_rel_corr)
}
scale_var_args <- list(s_l=0.4, 0.8)
scale_rel_args <- list(m_l=0, m_u=0.15, r_l=-0.3, r_u=0.3, D=nrow(abs_abund))
bayes_corr_res <- bpimC(Y_genus, scale_var_sampler,
				        scale_rel_sampler, scale_var_args,
				        scale_rel_args, nsample=2000)
```

## References
<hr style="border: none; border-top: 2px solid black; margin: 0rem 0;">
<div style="margin-top: 2rem; margin-bottom: 2rem;"></div>

[1] Friedman J, Alm EJ (2012) Inferring Correlation Networks from Genomic Survey Data. PLOS Computational Biology 8(9): e1002687. https://doi.org/10.1371/journal.pcbi.1002687

[2] Vandeputte, D., Kathagen, G., D’hoe, K. et al. Quantitative microbiome profiling links gut community variation to microbial load. Nature 551, 507–511 (2017). https://doi.org/10.1038/nature24460  

[3] Nixon MP, Letourneau J, David LA, Lazar NA, Mukherjee S, Silverman JD. Scale Reliant Inference. 2023. Preprint at arXiv:2201.03616
